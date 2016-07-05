<?php  

class parserLinkAdminTest extends PHPUnit_Framework_TestCase
{ 
    
    public function testLink1()
    {
        $parser = new \service\ParserLinkAdmin();
        
        $text = 'ooo @1234567890 ooo';
        
        echo "$text \n";
        echo $parser->toAdminLink($text);
        
         
    }

}
