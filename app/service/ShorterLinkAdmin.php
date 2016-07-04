<?php

namespace service;
 
class ShorterLinkAdmin
{ 
    public function adminLink($text)
    {
        $pattern = '~http://.+?/argue/profile/(\d+)/?~iu';
        return preg_replace($pattern, '@$1', $text);
    }
    
    public function profileLink($text)
    {
        $pattern = '~http://.+?/userinfo/profile/(\d+)/?~iu';
        return preg_replace($pattern, '#$1', $text);
    }
    
    public function anketaLink($text)
    { 
        $pattern = '~http://.+?/(\d+)/?~iu';
        return preg_replace($pattern, 'U$1', $text);
    }
    
    public function helpLink($text)
    { 
        $pattern = '~http://.+?/admin/sethelp/?id=(\d+)/?~iu';
        return preg_replace($pattern, 'H$1', $text);
    }
    
    public function blogLink($text)
    {
        return $text;
    }
     
    public function replace($text)
    {
        $result = $text;
        $result = $this->adminLink($result); 
        $result = $this->profileLink($result); 
        $result = $this->anketaLink($result); 
        $result = $this->helpLink($result); 
        return $result;
    }
    
    
}
