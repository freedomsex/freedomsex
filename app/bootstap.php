<?php   
/**   
 * Файл запуска движка
 * 
 */                       
session_start();
  
require ('conf/general.php');               // загрузка главного конфига, константы-пути
require (PATH_CORE . '/Autoloader.php'); 

mb_internal_encoding("UTF-8");

Autoloader::init(); 
                       
core\DB::getInstance(); 
core\Lang::getInstance(); 
                                             
$oRouter = core\Router::getInstance();    

if ($_SERVER['PHP_SELF'] == '/index_one.php') // [!!!]...   
    $oRouter->Start();
