<?php  

class shorterLinkAdminTest extends PHPUnit_Framework_TestCase
{ 
    
    public function testLink1()
    {
        $parser = new \service\ShorterLinkAdmin();
        
        $text = 'ooo http://freedomsex.net/userinfo/profile/12411605/ ooo';
        
        echo "$text \n";
        echo $parser->profileLink($text);
        
         
    }

}
