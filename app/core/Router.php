<?php     
namespace core;

class Router extends FsObject 
{      
    
    public static $default_page = 'index';
                    
    /**
     * Текущий префикс в URL, может указывать, например, на язык: ru или en
     *
     * @var string|null
     */                    
    //static protected $sPrefixUrl = null;
    /**
     * Порт при http запросе
     *
     * @var null
     */
    //static protected $iHttpPort = null;
    /**
     * Порт при https запросе
     *
     * @var null
     */
    //static protected $iHttpSecurePort = null;
    /**
     * Указывает на необходимость принудительного использования https
     *
     * @var bool
     */
    //static protected $bHttpSecureForce = false;
    /**
     * Указывает на необходимость принудительного использования http
     *
     * @var bool
     */  
    //static protected $bHttpSecureForce = false;
    /**
     * Указывает на необходимость принудительного использования http
     *
     * @var bool
     */
    //static protected $bHttpNotSecureForce = false;
    static protected $sAction = null;
    /**
     * Текущий евент
     *
     * @var string|null
     */
    static protected $sActionEvent = null;
    /**
     * Имя текущего евента
     *
     * @var string|null
     */
    static protected $sActionEventName = null;
    /**
     * Класс текущего экшена
     *
     * @var string|null
     */
    static protected $sActionClass = null;
    /**
     * Текущий полный ЧПУ url
     *
     * @var string|null
     */
    static protected $sPathWebCurrent = null;
    /**
     * Список параметров ЧПУ url
     * <pre>/action/event/param0/param1/../paramN/</pre>
     *
     * @var array
     */
    static protected $aParams = array();
    /**
     * Объект текущего экшена
     *
     * @var Action|null
     */
    protected $oAction = null;
    /**
     * Объект ядра
     *
     * @var Engine|null
     */
    protected $oEngine = null;
    /**
     * Покаывать или нет статистику выполнения
     *
     * @var bool
     */
    static protected $bShowStats = true;
    /**
     * Объект роутинга
     * @see getInstance
     *
     * @var Router|null
     */
    
     
     
    /**
     * Объект роутинга
     * @see getInstance
     *
     * @var Router|null
     */
    static protected $oInstance = null;
              
     
    /**
     * Делает возможным только один экземпляр этого класса
     *
     * @return Router
     */ 
    static public function getInstance()
    {                                         
        if (isset(self::$oInstance) and (self::$oInstance instanceof self)) {
            return self::$oInstance;
        } else {
            self::$oInstance = new self();
            return self::$oInstance;
        }
    }  
    
    /**
     *  
     */
    public function __construct()
    {
        //parent::__construct();
         
    }
       
       
       
       
       
    public function Start() 
    {      
                 
        $this->ParseUrl();          
           
        //$this->oEngine = Engine::getInstance();
        //$this->oEngine->Init();
        $this->StartAction();
        $this->Shutdown(false);
        
    }
  
    /**
     * Парсим URL
     * Пример: http://site.ru/action/event/param1/param2/  на выходе:
     *    self::$sAction='action';
     *    self::$sActionEvent='event';
     *    self::$aParams=array('param1','param2');
     *
     */
    protected function ParseUrl()
    {
        $sReq = $this->GetRequestUri();
        $aRequestUrl = $this->GetRequestArray($sReq);
        /**
         * Проверяем на наличие префикса в URL
         */
        //if ($sPrefixRule = Config::Get('router.prefix')) {
        //    if (isset($aRequestUrl[0]) and preg_match('#^' . $sPrefixRule . '$#i', $aRequestUrl[0])) {
        //        self::$sPrefixUrl = array_shift($aRequestUrl);
        //    } elseif ($sPrefixDefault = Config::Get('router.prefix_default')) {
        //        self::$sPrefixUrl = $sPrefixDefault;
        //    }
        //}
        
        $aRequestUrl = $this->RewriteRequest($aRequestUrl);
        self::$sAction = array_shift($aRequestUrl);
        self::$sActionEvent = array_shift($aRequestUrl);
        self::$aParams = $aRequestUrl; 
        
    }  
     
    /**
     * Метод выполняет первичную обработку $_SERVER['REQUEST_URI']
     *
     * @return string
     */
    protected function GetRequestUri()
    {
        $sReq = preg_replace("/\/+/", '/', $_SERVER['REQUEST_URI']);
        $sReq = preg_replace("/^\/(.*)\/?$/U", '\\1', $sReq);
        $sReq = preg_replace("/^(.*)\?.*$/U", '\\1', $sReq);
        /**
         * Формируем $sPathWebCurrent 
         */
        self::$sPathWebCurrent = PATH_ROOT . DS . join('/', $this->GetRequestArray($sReq));
        
        return $sReq;
        
    }  
     
    /**
     * Возвращает массив реквеста
     *
     * @param string $sReq Строка реквеста
     * @return array
     */
    protected function GetRequestArray($sReq)
    {
        $aRequestUrl = ($sReq == '') ? array() : explode('/', trim($sReq, '/'));
        
        for ($i = 0; $i < 7; $i++) {
            array_shift($aRequestUrl);
        }
        
        $aRequestUrl = array_map('urldecode', $aRequestUrl);
        
        return $aRequestUrl;
        
    }   
    
    /**
     * Применяет к реквесту правила реврайта из конфига Config::Get('router.uri')
     *
     * @param $aRequestUrl    Массив реквеста
     * @return array
     */
    protected function RewriteRequest($aRequestUrl)
    {
        /**
         * Правила Rewrite для REQUEST_URI
         */
        $sReq = implode('/', $aRequestUrl);
        //if ($aRewrite = Config::Get('router.uri')) {
        //    $sReq = preg_replace(array_keys($aRewrite), array_values($aRewrite), $sReq);
        //}
        
        return ($sReq == '') ? array() : explode('/', $sReq);
        
    }  
    
    
    /**
     * Определяет какой класс соответствует текущему экшену
     *
     * @return string
     */
    protected function DefineActionClass()
    {
    //    if (isset($this->aConfigRoute['page'][self::$sAction])) {
    //    } elseif (self::$sAction === null) {
    //        self::$sAction = $this->aConfigRoute['config']['default']['action'];
    //        if (!is_null($sEvent = $this->aConfigRoute['config']['default']['event'])) {
    //            self::$sActionEvent = $sEvent;
    //        }
    //        if (is_array($aParams = $this->aConfigRoute['config']['default']['params'])) {
    //            self::$aParams = $aParams;
    //        }
    //        if (is_array($aRequest = $this->aConfigRoute['config']['default']['request'])) {
    //            foreach ($aRequest as $k => $v) {
    //                if (!array_key_exists($k, $_REQUEST)) {
    //                    $_REQUEST[$k] = $v;
    //                }
    //            }
    //        }
    //    } else {
    //        //Если не находим нужного класса то отправляем на страницу ошибки
    //        self::$sAction = $this->aConfigRoute['config']['action_not_found'];
    //        self::$sActionEvent = '404';
    //    }
    //    self::$sActionClass = $this->aConfigRoute['page'][self::$sAction];
    //    return self::$sActionClass;
             
        if (self::$sAction === null) 
        {
            self::$sAction = 'index';
            self::$sActionEvent = 'index';
        }     
             
             
        return self::$sAction;
     
    }

    
    
      
       
    /**
     * Запускает на выполнение экшен
     * Может запускаться рекурсивно если в одном экшене стоит переадресация на другой
     *
     */
    public function StartAction()
    { 
        $sActionClass = $this->DefineActionClass();
     
        $sClassName = $sActionClass;
        $this->oAction = new $sClassName(CONTR . self::$sAction);
         
        //$res = $this->oAction->ExecEvent(); 
        //self::$sActionEventName = $this->oAction->GetCurrentEventName(); 
        //$this->oAction->EventShutdown();
         
           
       $action = ACTION.$action_name;  
                  
       if(method_exists($this->oAction, $action))
       {                                 
        // вызываем действие контроллера
        $controller->$action();
       } 
       else
       {
        // здесь также разумнее было бы кинуть исключение
        //Route::ErrorPage404();
        // echo 'нет метода' ;
       } 
         
    }

        
    /**
     * Завершение работы роутинга
     *
     * @param bool $bExit Принудительно завершить выполнение скрипта
     */
    public function Shutdown($bExit = true)
    {
        $this->AssignVars();
        //$this->oEngine->Shutdown();
        //$this->Viewer_Display($this->oAction->GetTemplate());
        if ($bExit) {
            exit();
        } 
    }

 
 
 
 
 
 
 
 
 
      
    /**
     * Возвращает текущий префикс URL
     *
     * @return string
     */
    static public function GetPrefixUrl()
    {
        return self::$sPrefixUrl;
    }    
     
    /**
     * Устанавливает текущий префикс URL
     *
     * @param string $sPrefix
     */
    static public function SetPrefixUrl($sPrefix)
    {
        self::$sPrefixUrl = $sPrefix;
    }      
     
    /**
     * Возвращает текущий экшен
     *
     * @return string
     */
    static public function GetAction()
    {
        return self::getInstance()->Standart(self::$sAction);
    }   
     
    /**
     * Устанавливает новый текущий экшен
     *
     * @param string $sAction Экшен
     */
    static public function SetAction($sAction)
    {
        self::$sAction = $sAction;
    }   
     
    /**
     * Возвращает текущий евент
     *
     * @return string
     */
    static public function GetActionEvent()
    {
        return self::$sActionEvent;
    }    
     
    /**
     * Возвращает имя текущего евента
     *
     * @return string
     */
    static public function GetActionEventName()
    {
        return self::$sActionEventName;
    }    
     
    /**
     * Возвращает класс текущего экшена
     *
     * @return string
     */
    static public function GetActionClass()
    {
        return self::$sActionClass;
    }    
     
    /**
     * Устанавливает новый текущий евент
     *
     * @param string $sEvent Евент
     */
    static public function SetActionEvent($sEvent)
    {
        self::$sActionEvent = $sEvent;
    }    
     
    /**
     * Возвращает параметры(те которые передаются в URL)
     *
     * @return array
     */
    static public function GetParams()
    {
        return self::$aParams;
    }     
     
    /**
     * Возвращает параметр по номеру, если его нет то возвращается null
     * Нумерация параметров начинается нуля
     *
     * @param int $iOffset
     * @param mixed|null $def
     * @return string
     */
    static public function GetParam($iOffset, $def = null)
    {
        $iOffset = (int)$iOffset;
        return isset(self::$aParams[$iOffset]) ? self::$aParams[$iOffset] : $def;
    }     
     
    /**
     * Устанавливает значение параметра
     *
     * @param int $iOffset Номер параметра, по идеи может быть не только числом
     * @param mixed $value
     */
    static public function SetParam($iOffset, $value)
    {
        self::$aParams[$iOffset] = $value;
    }     
     
    /**
     * Устанавливает новые текущие параметры
     *
     * @param string $aParams Параметры
     */
    static public function SetParams($aParams)
    {
        self::$aParams = $aParams;
    }
    
    /**
     * Показывать или нет статистику выполение скрипта
     * Иногда бывает необходимо отключить показ, например, при выводе RSS ленты
     *
     * @param bool $bState
     */  
    
    static public function SetIsShowStats($bState)
    {
        self::$bShowStats = $bState;
    }
    /**
     * Возвращает статус показывать или нет статистику
     *
     * @return bool
     */  
    
    static public function GetIsShowStats()
    {
        return self::$bShowStats;
    }
    
    /**
     * Проверяет запрос послан как ajax или нет
     *
     * @return bool
     */
    static public function GetIsAjaxRequest()
    {
        return isAjaxRequest();
    }

 
 
 
 
 
 
 
}
