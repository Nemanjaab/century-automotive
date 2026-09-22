<?php
declare(strict_types=1);
require dirname(__DIR__) . '/bootstrap.php';
century_start_session();

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    century_json(['ok'=>false,'message'=>'Method not allowed.'],405);
}
century_require_csrf($_SERVER['HTTP_X_CSRF_TOKEN'] ?? null);

// Gentle session throttle: blocks accidental double-submits and basic spam without
// collecting visitor IP addresses in the appointment database.
$now = time();
$lastSubmit = (int)($_SESSION['century_last_submit'] ?? 0);
if ($lastSubmit > 0 && ($now - $lastSubmit) < 8) {
    century_json(['ok'=>false,'message'=>'Please wait a few seconds before sending another request.'],429);
}

$raw = file_get_contents('php://input');
$data = json_decode($raw ?: '{}', true);
if (!is_array($data)) century_json(['ok'=>false,'message'=>'Invalid request body.'],400);
if (!empty($data['company'])) century_json(['ok'=>true,'reference'=>'CA-OK']);

$fields = [
  'name'=>80,'phone'=>30,'email'=>120,'vehicle_year'=>4,'vehicle_make'=>40,'vehicle_model'=>40,
  'service'=>100,'issue'=>1200,'preferred_date'=>10,'preferred_window'=>50
];
$out=[];
foreach($fields as $key=>$max){
    $out[$key]=century_clean((string)($data[$key]??''),$max);
    if($out[$key]==='') century_json(['ok'=>false,'message'=>'Please complete every required field.'],422);
}

if(!filter_var($out['email'],FILTER_VALIDATE_EMAIL)) century_json(['ok'=>false,'message'=>'Enter a valid email address.'],422);
if(!preg_match('/^[+0-9() .\-]{7,30}$/',$out['phone'])) century_json(['ok'=>false,'message'=>'Enter a valid phone number.'],422);
if(!preg_match('/^(19|20)\d{2}$/',$out['vehicle_year'])) century_json(['ok'=>false,'message'=>'Enter a valid vehicle year.'],422);
$vehicleYear=(int)$out['vehicle_year'];
$currentYear=(int)date('Y');
if($vehicleYear < 1900 || $vehicleYear > $currentYear + 1) century_json(['ok'=>false,'message'=>'Enter a valid vehicle year.'],422);
if(!preg_match('/^\d{4}-\d{2}-\d{2}$/',$out['preferred_date'])) century_json(['ok'=>false,'message'=>'Choose a valid preferred date.'],422);

$dt=DateTimeImmutable::createFromFormat('!Y-m-d',$out['preferred_date']);
$today=new DateTimeImmutable('today');
if(!$dt || $dt < $today) century_json(['ok'=>false,'message'=>'Please choose a future date.'],422);
$day=(int)$dt->format('N');
if($day >= 6) century_json(['ok'=>false,'message'=>'Century Automotive is closed Saturday and Sunday. Please choose a weekday.'],422);

$allowedWindows=['Morning · 7–10 AM','Midday · 10 AM–1 PM','Afternoon · 1–4 PM','Any time that day'];
if(!in_array($out['preferred_window'],$allowedWindows,true)) century_json(['ok'=>false,'message'=>'Choose a valid preferred time window.'],422);

$allowedServices=['Engine Diagnostics & Repair','Tire Change & Mounting','Seasonal Tire Storage / Tire Hotel','Tire Sales','Wheel Balancing & Centering','Wheel Alignment / Suspension Geometry','Towing / Vehicle Recovery','Replacement Vehicle / Courtesy Rental','Vehicle Wash & Delivery Clean','Air Conditioning & Heating','Brakes & Safety Inspection','Oil Change & Scheduled Maintenance','Battery & Electrical','Pre-Purchase Inspection','Not sure / Diagnose a problem','Other'];
if(!in_array($out['service'],$allowedServices,true)) century_json(['ok'=>false,'message'=>'Choose a valid service.'],422);

$contactPreference=(string)($data['contact_preference']??'phone');
if(!in_array($contactPreference,['phone','email','either'],true)) $contactPreference='phone';

$reference='CA-'.strtoupper(substr(bin2hex(random_bytes(4)),0,8));
$record = [
 'reference'=>$reference,
 'created_at'=>(new DateTimeImmutable('now', new DateTimeZone('UTC')))->format(DateTimeInterface::ATOM),
 'updated_at'=>(new DateTimeImmutable('now', new DateTimeZone('UTC')))->format(DateTimeInterface::ATOM),
 'name'=>$out['name'], 'phone'=>$out['phone'], 'email'=>$out['email'], 'contact_preference'=>$contactPreference,
 'vehicle_year'=>$out['vehicle_year'], 'vehicle_make'=>$out['vehicle_make'], 'vehicle_model'=>$out['vehicle_model'],
 'service'=>$out['service'], 'issue'=>$out['issue'], 'preferred_date'=>$out['preferred_date'],
 'preferred_window'=>$out['preferred_window'],
 'needs_tow'=>(($data['needs_tow']??'')==='yes'?'yes':'no'),
 'needs_replacement_vehicle'=>(($data['needs_replacement_vehicle']??'')==='yes'?'yes':'no'),
 'add_wash'=>(($data['add_wash']??'')==='yes'?'yes':'no'),
 'status'=>'new', 'admin_note'=>''
];
century_store_add($record);
$_SESSION['century_last_submit']=$now;
century_json(['ok'=>true,'reference'=>$reference]);
