<?php

namespace service;

use \view\AdmInter;

class ParserLinkAdmin
{

    function __construct()
    {
        
    }
    
    public function toAdminLink($text)
    {
        $pattern = '/(\s)@(\d+)(\s)/iu';
        $result = preg_replace_callback($pattern, function ($m) {
            return $m[1].AdmInter::moderatorLink($m[2]).$m[3];
        }, $text);
        return $result;
    }
    
    public function toProfileLink($text)
    {
        $pattern = '/(\s)#(\d+)(\s)/iu';
        $result = preg_replace_callback($pattern, function ($m) {
            return $m[1].AdmInter::profileLink($m[2]).$m[3];
        }, $text);
        return $result;
    }
    
    public function toHelpLink($text)
    {
        $pattern = '/(\s)H(\d+)(\s)/iu';
        $result = preg_replace_callback($pattern, function ($m) {
            return $m[1].AdmInter::helpHistoryLink($m[2]).$m[3];
        }, $text);
        return $result;
    }
    
    public function toUserLink($text)
    {
        $pattern = '/(\s)U(\d+)(\s)/iu';
        $result = preg_replace_callback($pattern, function ($m) {
            return $m[1].AdmInter::userLink($m[2]).$m[3];
        }, $text);
        return $result;
    }
    
    public function toBlogLink($text)
    {
        return $text;
    } 
     
    public function replace($text)
    {
        $result = $text;
        $result = $this->toAdminLink($result); 
        $result = $this->profileLink($result); 
        $result = $this->anketaLink($result); 
        $result = $this->helpLink($result); 
        return $result;
    }
}

