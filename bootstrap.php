<?php
declare(strict_types=1);


// Baseline browser hardening for both the public site and staff area.
if (PHP_SAPI !== 'cli' && !headers_sent()) {
    header_remove('X-Powered-By');
    header('X-Content-Type-Options: nosniff');
    header('X-Frame-Options: DENY');
    header('Referrer-Policy: strict-origin-when-cross-origin');
    header('Permissions-Policy: camera=(), microphone=(), geolocation=(), payment=()');
    header("Content-Security-Policy: default-src 'self'; script-src 'self' https://cdnjs.cloudflare.com; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src https://fonts.gstatic.com; img-src 'self' data:; connect-src 'self'; object-src 'none'; base-uri 'self'; frame-ancestors 'none'; form-action 'self'");
}

function century_start_session(): void {
    if (session_status() === PHP_SESSION_ACTIVE) return;
    $secure = (!empty($_SERVER['HTTPS']) && $_SERVER['HTTPS'] !== 'off') || strtolower((string)($_SERVER['HTTP_X_FORWARDED_PROTO'] ?? '')) === 'https';
    session_set_cookie_params([
        'httponly' => true,
        'samesite' => 'Lax',
        'secure' => $secure,
        'path' => '/',
    ]);
    session_start();
}

function century_data_file(): string {
    // Keep customer data OUTSIDE the public website directory.
    // Production hosts can override this with CENTURY_DATA_DIR.
    $configured = trim((string)getenv('CENTURY_DATA_DIR'));
    $dataDir = $configured !== '' ? $configured : dirname(__DIR__) . '/century-automotive-private';
    if (!is_dir($dataDir) && !mkdir($dataDir, 0770, true) && !is_dir($dataDir)) {
        throw new RuntimeException('Could not create private appointment storage.');
    }
    $file = rtrim($dataDir, DIRECTORY_SEPARATOR) . DIRECTORY_SEPARATOR . 'appointments.json';
    if (!file_exists($file)) {
        file_put_contents($file, "[]\n", LOCK_EX);
        @chmod($file, 0660);
    }
    return $file;
}

function century_decode_rows(string $raw): array {
    $rows = json_decode($raw !== '' ? $raw : '[]', true);
    if (!is_array($rows) || json_last_error() !== JSON_ERROR_NONE) {
        throw new RuntimeException('Appointment storage is unreadable; refusing to overwrite it.');
    }
    return $rows;
}

function century_store_read(): array {
    $file = century_data_file();
    $fh = fopen($file, 'c+');
    if (!$fh) throw new RuntimeException('Could not open appointment storage.');
    flock($fh, LOCK_SH);
    rewind($fh);
    $raw = stream_get_contents($fh) ?: '[]';
    flock($fh, LOCK_UN);
    fclose($fh);
    return century_decode_rows($raw);
}

function century_store_add(array $appointment): array {
    $file = century_data_file();
    $fh = fopen($file, 'c+');
    if (!$fh) throw new RuntimeException('Could not open appointment storage.');
    flock($fh, LOCK_EX);
    rewind($fh);
    $rows = century_decode_rows(stream_get_contents($fh) ?: '[]');
    $maxId = 0;
    foreach ($rows as $row) $maxId = max($maxId, (int)($row['id'] ?? 0));
    $appointment['id'] = $maxId + 1;
    $rows[] = $appointment;
    @copy($file, $file . '.bak');
    rewind($fh); ftruncate($fh, 0);
    fwrite($fh, json_encode($rows, JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES) . "\n");
    fflush($fh); flock($fh, LOCK_UN); fclose($fh);
    return $appointment;
}

function century_store_update(int $id, array $changes): bool {
    $file = century_data_file();
    $fh = fopen($file, 'c+');
    if (!$fh) throw new RuntimeException('Could not open appointment storage.');
    flock($fh, LOCK_EX);
    rewind($fh);
    $rows = century_decode_rows(stream_get_contents($fh) ?: '[]');
    $found = false;
    foreach ($rows as &$row) {
        if ((int)($row['id'] ?? 0) === $id) {
            foreach ($changes as $k => $v) $row[$k] = $v;
            $found = true; break;
        }
    }
    unset($row);
    if ($found) {
        @copy($file, $file . '.bak');
        rewind($fh); ftruncate($fh, 0);
        fwrite($fh, json_encode($rows, JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES) . "\n");
        fflush($fh);
    }
    flock($fh, LOCK_UN); fclose($fh);
    return $found;
}

function century_json(array $payload, int $status = 200): never {
    http_response_code($status);
    header('Content-Type: application/json; charset=utf-8');
    header('Cache-Control: no-store');
    echo json_encode($payload, JSON_UNESCAPED_SLASHES);
    exit;
}

function century_csrf(): string {
    century_start_session();
    if (empty($_SESSION['csrf'])) $_SESSION['csrf'] = bin2hex(random_bytes(24));
    return $_SESSION['csrf'];
}

function century_require_csrf(?string $token): void {
    century_start_session();
    $expected = $_SESSION['csrf'] ?? '';
    if (!$token || !$expected || !hash_equals($expected, $token)) {
        century_json(['ok' => false, 'message' => 'Your session expired. Refresh and try again.'], 419);
    }
}

function century_clean(string $value, int $max = 500): string {
    $value = trim(preg_replace('/\s+/', ' ', $value) ?? '');
    return function_exists('mb_substr') ? mb_substr($value, 0, $max) : substr($value, 0, $max);
}
