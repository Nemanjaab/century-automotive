<?php
declare(strict_types=1);
require dirname(__DIR__) . '/bootstrap.php';
century_start_session();
if(empty($_SESSION['century_admin'])) century_json(['ok'=>false,'message'=>'Unauthorized.'],401);

$allowedStatuses=['new','confirmed','received','in_service','ready','completed','declined'];

if($_SERVER['REQUEST_METHOD']==='GET'){
  $rows=century_store_read();
  $priority=['new'=>0,'confirmed'=>1,'received'=>2,'in_service'=>3,'ready'=>4,'completed'=>5,'declined'=>6];
  usort($rows,function($a,$b) use($priority){
    $pa=$priority[$a['status']??'new']??9; $pb=$priority[$b['status']??'new']??9;
    if($pa!==$pb) return $pa<=>$pb;
    $da=$a['preferred_date']??''; $db=$b['preferred_date']??'';
    if($da!==$db) return strcmp($da,$db);
    return ((int)($b['id']??0))<=>((int)($a['id']??0));
  });
  century_json(['ok'=>true,'appointments'=>$rows]);
}

if($_SERVER['REQUEST_METHOD']==='POST'){
  century_require_csrf($_SERVER['HTTP_X_CSRF_TOKEN']??null);
  $data=json_decode(file_get_contents('php://input')?:'{}',true);
  if(!is_array($data)) century_json(['ok'=>false,'message'=>'Invalid request.'],400);
  $id=(int)($data['id']??0);
  $status=(string)($data['status']??'');
  $note=century_clean((string)($data['admin_note']??''),1000);
  if($id<1||!in_array($status,$allowedStatuses,true)) century_json(['ok'=>false,'message'=>'Invalid update.'],422);
  $changes=['status'=>$status,'admin_note'=>$note,'updated_at'=>(new DateTimeImmutable('now',new DateTimeZone('UTC')))->format(DateTimeInterface::ATOM)];
  if(!century_store_update($id,$changes)) century_json(['ok'=>false,'message'=>'Request not found.'],404);
  century_json(['ok'=>true]);
}
century_json(['ok'=>false,'message'=>'Method not allowed.'],405);
