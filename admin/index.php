<?php
declare(strict_types=1);
require dirname(__DIR__) . '/bootstrap.php';
century_start_session();
$csrf=century_csrf();

$configured=trim((string)getenv('CENTURY_ADMIN_PASSWORD'));
$configuredHash=trim((string)getenv('CENTURY_ADMIN_PASSWORD_HASH'));
$remote=(string)($_SERVER['REMOTE_ADDR']??'');
$isLocal=in_array($remote,['127.0.0.1','::1'],true);
$demoMode=$configured==='' && $configuredHash==='' && $isLocal;
$adminEnabled=$configured!=='' || $configuredHash!=='' || $demoMode;
$error='';

if(isset($_POST['logout'])){
    century_require_csrf($_POST['csrf']??'');
    $_SESSION=[];
    if(ini_get('session.use_cookies')){
        $params=session_get_cookie_params();
        setcookie(session_name(),'',time()-42000,$params['path'],$params['domain']??'',(bool)$params['secure'],(bool)$params['httponly']);
    }
    session_destroy();
    header('Location: ./');exit;
}

if(isset($_POST['password'])){
    century_require_csrf($_POST['csrf']??'');
    $attempts=(int)($_SESSION['century_login_attempts']??0);
    $lockedUntil=(int)($_SESSION['century_login_locked_until']??0);
    if($lockedUntil>time()){
        $error='Too many attempts. Try again in '.($lockedUntil-time()).' seconds.';
    } elseif(!$adminEnabled){
        $error='Staff access is not configured on this server.';
    } else {
        $candidate=(string)$_POST['password'];
        $valid=$demoMode ? hash_equals('demo1234',$candidate) : ($configuredHash!=='' ? password_verify($candidate,$configuredHash) : hash_equals($configured,$candidate));
        if($valid){
            session_regenerate_id(true);
            $_SESSION['century_admin']=true;
            $_SESSION['century_login_attempts']=0;
            unset($_SESSION['century_login_locked_until']);
            header('Location: ./');exit;
        }
        $attempts++;
        $_SESSION['century_login_attempts']=$attempts;
        if($attempts>=5){$_SESSION['century_login_locked_until']=time()+30;$_SESSION['century_login_attempts']=0;$error='Too many attempts. Staff login is locked for 30 seconds.';}
        else{$error='Incorrect password.';}
    }
}
$logged=!empty($_SESSION['century_admin']);
?>
<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover">
  <meta name="robots" content="noindex,nofollow,noarchive">
  <meta name="csrf-token" content="<?=htmlspecialchars($csrf,ENT_QUOTES)?>">
  <title>Century Automotive · Staff</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=DM+Mono:wght@400;500&family=Manrope:wght@400;600;700;800&display=swap" rel="stylesheet">
  <link rel="stylesheet" href="../assets/admin.css?v=4">
</head>
<body>
<?php if(!$logged): ?>
<main class="login-shell">
  <form class="login-card" method="post" autocomplete="on">
    <div class="mark">|||</div>
    <p class="eyebrow">CENTURY AUTOMOTIVE / STAFF</p>
    <h1>Service desk.</h1>
    <p>Private workspace for customer service requests and repair status.</p>
    <?php if($demoMode):?><div class="demo-note">Local demo mode is active.<br>Production requires <code>CENTURY_ADMIN_PASSWORD</code> or <code>CENTURY_ADMIN_PASSWORD_HASH</code>.</div><?php endif;?>
    <input type="hidden" name="csrf" value="<?=htmlspecialchars($csrf,ENT_QUOTES)?>">
    <?php if(!$adminEnabled):?>
      <div class="demo-note">Staff access is disabled until a production admin password is configured.</div>
    <?php else:?>
      <label>Password<input type="password" name="password" autocomplete="current-password" autofocus required></label>
    <?php endif;?>
    <?php if($error):?><div class="error"><?=htmlspecialchars($error)?></div><?php endif;?>
    <button <?=!$adminEnabled?'disabled':''?>>Enter dashboard →</button>
    <a href="../">← Back to website</a>
  </form>
</main>
<?php else: ?>
<header class="admin-header">
  <div class="admin-brand"><b>CENTURY</b><span> SERVICE DESK</span></div>
  <div class="admin-header-actions"><a href="../">Website ↗</a><form method="post"><input type="hidden" name="csrf" value="<?=htmlspecialchars($csrf,ENT_QUOTES)?>"><button name="logout">Sign out</button></form></div>
</header>
<main class="admin-main">
  <section class="admin-title">
    <div><p class="eyebrow">SERVICE OPERATIONS</p><h1>Shop queue.</h1><p class="admin-subtitle">Search, review and move requests through the service workflow.</p></div>
    <div class="counts">
      <div><strong id="count-new">0</strong><span>NEW</span></div>
      <div><strong id="count-confirmed">0</strong><span>CONFIRMED</span></div>
      <div><strong id="count-active">0</strong><span>ACTIVE</span></div>
      <div><strong id="count-ready">0</strong><span>READY</span></div>
    </div>
  </section>
  <section class="toolbar">
    <div class="filters" aria-label="Filter requests">
      <button class="active" data-filter="all">All</button>
      <button data-filter="new">New</button>
      <button data-filter="confirmed">Confirmed</button>
      <button data-filter="active">Active</button>
      <button data-filter="ready">Ready</button>
      <button data-filter="completed">Completed</button>
      <button data-filter="declined">Declined</button>
    </div>
    <div class="toolbar-actions"><label class="search"><span>SEARCH</span><input id="request-search" type="search" placeholder="Name, phone, vehicle, reference…" autocomplete="off"></label><button id="refresh">Refresh ↻</button></div>
  </section>
  <section id="queue" class="queue"><div class="empty">Loading requests…</div></section>
</main>
<div class="drawer" id="drawer" aria-hidden="true"><div class="drawer-panel"><button class="drawer-close" aria-label="Close">×</button><div id="drawer-content"></div></div></div>
<script src="../assets/admin.js?v=4"></script>
<?php endif; ?>
</body>
</html>
