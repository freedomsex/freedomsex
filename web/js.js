 
$(document).ready(function() 
{               
    slider.init();
    storage.init();
    giper_chat.init();
    notepad.init();
               
    mailsett.init(); 
    report.init(); 
    navigate.init();
  
    name_suggest.init(); 
    
}); 
      
   
// -- Получить новый хэш ---
var hash; 
function simple_hash() { 
  var now = new Date(); 
   hash = now.getTime();  
}
     
function disabled_with_timeout(elem,time) {  
 elem.prop("disabled",true);
 setTimeout( function (){
  elem.prop("disabled",false);
 },time * 1000); 
}
      
    
var json = {
        
    parse: function (str) 
    {
        var result = null;
        try 
        {
            result = JSON.parse(str);
        } 
        catch (e) { }
        
        return result;
    } ,
    
    encode: function (str) 
    {
        return JSON.stringify(str); 
    }       
}       
    
           
              
var active_textarea ;             ////////////////////////////////////////////////////////
var giper_chat = {    
        
    open_mess:  0,
    idle_round: 0,
    count_unread: 0, 
    cascade: 0,
     
    round_time: 0, 
    round_open: 1, 
    
    timer_id:   null,  
    mess_block: null, 
    
    mess_stock: [],
          prev_title: null,
        
    init: function () 
    {             
        if (device.width() > 1200)
        {
            $('<div id="block_timer" class="timer">').appendTo( 'body' );
            giper_chat.timer_set(); 
            
            giper_chat.mess_stock = storage.array.load('mess_stock'); 
            giper_chat.remind();  
        }      
         
        $('#giper_reply .post').on('click', giper_chat.reply_show);  
        // Установка текста по умолчанию
        if (storage.load('reply_all'))  
            $('#giper_reply textarea').val(storage.load('reply_all'));
        giper_chat.prev_title = document.title;
        
                                     
    } ,

    set_unread: function () 
    {      
        if (giper_chat.count_unread > 0) 
        {
            $('#count_new_message').html('(<b>' + giper_chat.count_unread + '</b>)');
            $('#menu_message').attr('title','Новых сообщений ' + giper_chat.count_unread); 
        } 
        else 
        {
            $('#count_new_message').html('');  
            $('#menu_message').attr('title','Новых сообщений нет');
        }                                 
    } , 
  
    on_timer: function () 
    {
        giper_chat.title_blink ();

        if (giper_chat.round_open && giper_chat.cascade == 0)
            giper_chat.round_time--

        //if (giper_chat.cascade != 0)console.log('on_timer cascade: ' +giper_chat.cascade)
  
        giper_chat.trace();
        
        if (giper_chat.round_time < 1) 
            giper_chat.new_round(); 
    } , 
    
    new_round: function () 
    {          
        giper_chat.timer_stop();
 
        if (giper_chat.open_mess < 9)
        {
            giper_chat.ajax_new();
        }
        else
            giper_chat.timer_set();
    } ,
    
    trace: function () 
    {
        $('#block_timer').text(giper_chat.round_time);
    } ,
  
    ajax_new: function () 
    {         
        simple_hash();  
        giper_chat.round_open = 0;
         
        $.get('/ajax/new_mess.php',{ hash: hash }, giper_chat.on_load) 
          .always( function() { giper_chat.round_open = 1; } );    
    } ,

    on_load: function (data)
    {
        if (data)
        {    
            var mess = JSON.parse( data ); 
            var text = mess.text;
            var name = mess.name ? mess.name + ':' : '' ;
               
            if (mess.type) 
            {   
                giper_chat.new_message (mess);  
                giper_chat.mess_stock.push(mess);
                giper_chat.stock.store(); 
            } 
              
            giper_chat.count_unread = mess.count_unread          ////////////////////////////////////
            giper_chat.set_unread();                             ////////////////////////////////////
        }  
        
        setTimeout( function (){ giper_chat.timer_set(); },5000 ); 
 
    } ,

    reply_enable: function ()
    {                      
        if (giper_chat.cascade == 0)
        {     
            if (giper_chat.open_mess > 2)                     
                $('#giper_reply').show('blind');
            if (giper_chat.open_mess > 5)                     
                $('#giper_reply textarea').show('blind');   
        }  
            
        if (giper_chat.open_mess < 3)                     
            $('#giper_reply').hide('blind');
        if (giper_chat.open_mess == 0)                     
            giper_chat.cascade = 0;      
                  
                // console.log('re cascade: ' +giper_chat.cascade)
            
    } ,

    reply_show: function ()
    {                                           
        var textarea = $('#giper_reply textarea');
        if (!$(textarea).is(":visible"))
        {                          
            active_textarea = textarea;  
            textarea.show('blind');  
            textarea.focus();            
            notepad.show();                                          ////////////////////////////////////
        }   
        else  
            giper_chat.reply_all();  
                                        
    } , 
    reply_all: function ()
    {  
        var textarea = $('#giper_reply textarea'); 
        var text = textarea.val(); 
         
        if (text)
        {                              
            var block_mess = $('#giper_stock').children().filter(':first');     
            giper_chat.cascade = text;
            storage.save('reply_all',text);
            $('textarea',block_mess).val(text);
            $('.post',block_mess).click(); 
            textarea.hide('blind'); 
        }              
        giper_chat.reply_enable();                  
    } ,
 
    new_message: function (val) 
    {                              //  elem.appendChild();   
                                
        giper_chat.open_mess++ 
        giper_chat.reply_enable(); 
        
        new_block = giper_chat.create_message(val);

        new_block.prependTo($('#giper_stock'));
          
        new_block.show('blind'); 

        setTimeout( function (){ $('.sound',new_block).show(); },500 ); 
                            
        giper_chat.idle_round = 0;  
               // giper_chat.mess_stock.push(val);
               // giper_chat.stock.store();           
     
    } ,  
    
    remind: function () 
    {                       
        jQuery.each (giper_chat.mess_stock,function(i,val) 
        {                     
            giper_chat.new_message(val);
        });             
    } , 
    
    stock: {  
          
        store: function () 
        {  
             storage.array.save('mess_stock',giper_chat.mess_stock);  
        } ,      
    
        remove: function (num) 
        {        
            var del = null;
            jQuery.each (giper_chat.mess_stock,function(i,val) 
            {                     
                if(val.mess_id == num)
                    del = i;
            });  
            
            if(del || del == 0)
            {      
                giper_chat.mess_stock.splice(del,1);     
                giper_chat.stock.store(); 
            }   
        }  
      
    } ,
    
     
    create_message: function (val) 
    {                  
        if (!val.reply) val.reply = '';
        
        var new_block = $('#new_message_ex').clone()
         .attr( 'id', val.type+'_'+val.mess_id )  //.css("display","none")  
         .data('number',val.mess_id)
         .data('user',val.user)
         .addClass( val.type );
                                              
         $('.mess_text',new_block).html(val.text);       // click( function (){ location.href =  }); 
         $('.close',new_block).click( 
             function ()
             { 
                 giper_chat.close_message($(new_block));  
             }
         );
         
         if( val.type == 'new_message' || val.type == 'old_message' ) 
         {        
             if( val.type == 'old_message' )
             {                 
                 $('.title',new_block).text('Есть сообщение без ответа'); 
                 $('.sound',new_block).remove(); 
             }         

             $('.post',new_block).click( function (){ giper_chat.post_mess(val); });

             $('textarea',new_block).val( val.reply );          
             $('.user_name',new_block).text(val.name+':'); 
             $('.history',new_block).click( 
             function ()
             {             
                 giper_chat.follow_message(val.user,val.mess_id);  
             });
                
             $('.bunn',new_block).click( function ()
             { 
                 giper_chat.ajax_bun(val.user,val.mess_id,val.type); 
                 giper_chat.open_mess--; 
             });  
 
             if( val.type == 'new_message' ) 
                 $('#contact_update').show('fade');
         }  
         
         if( val.type == 'server_mess' ) 
         { 
             $('.sound',new_block).remove(); 
             $('.title',new_block).text( val.reply );  
             $('.bunn',new_block).remove();  
             $('.post',new_block).val('Хорошо');

             $('.post',new_block).click(
                 function ()
                 { 
                     send_serv_mess($('#'+val.type+'_'+val.mess_id ),'tip_user_bun_close')  
                 }
              ); 
 
              $('.history',new_block).text( 'Подробнее...' ) ;
              $('.history',new_block).attr( 'href','/блог/наказывайте-кого-следует/' ) ;
              $('.history',new_block).attr( 'target','_blank' ) ;
         }  
         
         if( val.type == 'air_user' || val.type == 'new_client' ) 
         {                           
             if( val.type == 'air_user' )         
                 $('.title',new_block).text('Сейчас на сайте');
             if( val.type == 'new_client' )         
                 $('.title',new_block).text('Зарегистрировалась сегодня');
 
             $('.mess_text',new_block).html(val.age + ' ' + val.city + ' ' + val.text);     
                 
             $('.sound',new_block).remove();   
             // var timer_air = setTimeout( function (){ close_message( $(new_block) ); open_mess--; },30000 );
             //$('.title',new_block).text( val.reply );  
             $('.bunn',new_block).remove();        
             $('.user_name',new_block).text(val.name+','); 
             $('.user_name',new_block).text(val.name+','); 
             $('.post',new_block).val('Написать');

             $('.post',new_block).click( function () { giper_chat.post_mess(val); }); 

             $('.history',new_block).text( 'Смотреть анкету' ) ;
             $('.history',new_block).click( 
             function ()
             {             
                 giper_chat.follow_message(val.user,val.mess_id);  
             });
              
             if( val.type == 'new_client' ) {
              
             }
         }      
           
         $(new_block).draggable( { 
             handle:'.title',
             stop: function(event, ui) 
             {
                 $('.sound',new_block).remove(); 
           
                 //alert ($(this).offset().left)
           
                 var topOff  = $(this).offset().top - $(window).scrollTop()
                 var leftOff = $(this).offset().left
                  $(this).css("top",topOff).css("left",leftOff).css("position","fixed")
           
                 $(this).appendTo( 'body' );
             } 
         });  /**/ 
  
         return new_block;

    } ,

    close_message: function (elem)
    {      
        $('.sound',elem).remove(); 
        elem.hide('blind');       
        giper_chat.open_mess--;
        giper_chat.stock.remove(elem.data('number'));
        setTimeout( function (){ elem.remove(); },500 ); 
    } ,
    
    close_all: function (user)
    {                                          /*
        $('#giper_stock div').
        $('.sound',elem).remove(); 
        elem.hide('blind');       
        giper_chat.open_mess--;
        giper_chat.stock.remove(elem.data('number'));
        setTimeout( function (){ elem.remove(); },500 ); */
    } ,

    follow_message: function (user,mess_id)
    {       
        giper_chat.stock.remove(mess_id); 
        location.href = '/'+user;
    } ,

    ajax_bun: function (user,mess_id,type) 
    {  
        giper_chat.close_message( $('#'+type+'_'+mess_id ) );  
        $.post( "/mess/bun/", { id: mess_id, tid: user } ); 
             
    } ,

    timer_set: function () 
    { 
        giper_chat.timer_stop();
        if (giper_chat.idle_round == 0) { giper_chat.round_time = 10;  } else
        if (giper_chat.idle_round == 1) { giper_chat.round_time = 5;   } else
        if (giper_chat.idle_round == 2) { giper_chat.round_time = 25;  } else
        if (giper_chat.idle_round == 3) { giper_chat.round_time = 35;  } else
        if (giper_chat.idle_round > 10) { giper_chat.round_time = 300; } else
        if (giper_chat.idle_round > 3 ) { giper_chat.round_time = 60;  } 
        
        giper_chat.idle_round++   
        giper_chat.timer_id = window.setInterval ( 'giper_chat.on_timer()', 1000 );   
        //console.log('таймер запущен: ' +giper_chat.round_time)
   
    } ,

    timer_stop: function () 
    {
        window.clearInterval(giper_chat.timer_id);  
        //console.log('таймер остановлен: ' +giper_chat.cascade)
    } , 

    timer_cut: function () 
    {
        if (giper_chat.idle_round > 0 && giper_chat.round_time > 10)
            giper_chat.round_time = 10;  
        giper_chat.idle_round = 0;
    } , 
    toggle_text: function () 
    {           
        var textarea   = $('textarea',giper_chat.mess_block); 
        var text_value = $(textarea).val(); 
        if (!$(textarea).is(":visible")) 
        {
            active_textarea = textarea;            ///////////////////////////////////////
            $(textarea).show('blind');
            $(textarea).focus();
            notepad.show();                        ///////////////////////////////////////
            return 0;     
        } 
        
        return text_value 
     
    } ,
     
    post_mess: function (val)
    {       
        giper_chat.mess_block = $('#'+val.type+'_'+val.mess_id);     // alert( user )
 
        var text, repl 
        
        if (giper_chat.cascade != 0)
        {
            text = giper_chat.cascade;
            repl = '';
        }
        else
        {      
            text = giper_chat.toggle_text();
            repl = text 
        } 
                                                   
        if (text)  
        {            
            simple_hash();
            
            $.post
            (
                "/mailer/post/", 
                {
                    mess: text, 
                    id:   val.user, 
                    re:   repl, 
                    captcha_code: $('.code',giper_chat.mess_block).val(), 
                    hash: hash
                 },  
                 giper_chat.on_post
             );  
                                                    
            disabled_with_timeout( $('.post',giper_chat.mess_block), 5); 
            giper_chat.timer_cut();
        }   
         
    } , 
     
    on_post: function (data)
    {                                // alert (data) 
        if( !data ) return 0;  
        var mess = JSON.parse( data );  
        
        if( mess.error == 'captcha' ) 
        {    
            $('textarea',giper_chat.mess_block).show('blind');
            $('.captcha_block',giper_chat.mess_block).show('blind');
            $('.captcha',giper_chat.mess_block).get(0).src = '/secret_pic.php?hash='+hash;      
        }

        if( mess.saved == '1' ) 
        {     
            giper_chat.idle_round = 0; 
                                   
            $('#contact_update').show('fade'); 
            giper_chat.close_message(giper_chat.mess_block); 

            notepad.hide();                 //////////////////////////////////////////////

            setTimeout( function ()
            { 
               if (giper_chat.cascade != 0)
                   giper_chat.reply_all(); 
            },700 );              
        } 
        
        if( mess.error == 'reload' ) 
        {            
            giper_chat.idle_round = 0;  
            location.href = '/'+user+'?text='+text; //alert ('reload')              
        }  

        disabled_with_timeout( $('.post',giper_chat.mess_block), 0.05); 
          
    } , 
       
    title_blink: function () 
    {
        if (giper_chat.count_unread == 0) 
        {
            document.title = giper_chat.prev_title;
            return false ; 
        }     
     
        if( document.title != 'Вам сообщение!' ) 
        {
            document.title = 'Вам сообщение!' ; 
        }
        else
            document.title = ' * * * * * * * * * * * * ' ; 
    } ,
     
    post_serv: function (elem,value)
    {               
        giper_chat.close_message( $(elem) );                   /*
        var param = {}; param[value] = 1;
         $.get( "/ajax/messages_load.php", param ); */
        set_cookie( 'user_bun', '1', 259200 ); 
    }
     
}
 
 
var notepad = {    
                    
    note_block: null, 
    last_click: null,
    disibled:   0,
    create:     0,    
        
    init: function () 
    {             
        if (device.width() < 1000)
        {           
            notepad.disibled = 1;                                                            
        }              
        
        notepad.disibled = get_cookie ('note_vis')*1 ? 1 : 0;   //////////////////////////

        active_textarea = $('#mess_text_val');
        notepad.note_block = $('.notepad');


        $('textarea').click( function ()
        { 
            active_textarea = this; 
            notepad.show();  
        });  
        
        $('#notepad_on').click( function (){ notepad.toggle_disable('on'); notepad.show('force'); });                                                   
               
        $('.close',notepad.note_block).click( function (){ notepad.hide(); });                
        $('.post',notepad.note_block).click( function (){ notepad.toggle_disable('off'); notepad.hide(); }); 
        $('.bunn',notepad.note_block).click( function (){ notepad.toggle_disable('off'); notepad.hide(); }); 
                                     
    } , 
    
    hide: function () 
    {     
        notepad.note_block.hide('fade');
    } ,  
    
    show: function (force) 
    {                                
        if (!notepad.disibled)     
        if (force || (active_textarea && notepad.last_click != active_textarea))
        {
            if (notepad.create) 
            {                                   
                notepad.note_block.show('fade');  
                notepad.last_click = active_textarea;        /////////////////////////////  
            }
            else
                notepad.ajax_load();   
        } 
    } ,
    
    toggle_disable: function (vset) 
    {                                         
        if (vset == 'off') notepad.disibled = 1;                       
        if (vset == 'on' ) notepad.disibled = 0;
                                      
        if (vset) 
        {                              
            set_cookie ('note_vis', notepad.disibled, 259200);   /////////////////////////
        } 
    } ,
    
    ajax_load: function () 
    {                              
         simple_hash(); 
         $.get( '/ajax/load_notepad.php', { hash: hash }, notepad.on_load); 
    } , 
    
    remind: function () 
    {      
        var top  = storage.load('notepad_top');
        var left = storage.load('notepad_left');
                                       
        if (top  && top  < 40) top  = 50;
        if (left && left < 10) left = 10; 
        if (top  > (device.height()-300)) top  = 0;
        if (left > (device.width()-300))  left = 0; 
         
        if (top)  notepad.note_block.css("top",top+'px');  
        if (left) notepad.note_block.css("left",left+'px');  
        
    } ,  
    
    on_load: function (data) 
    {           
           if( data.indexOf('div') > 0 ) 
           { 
               notepad.create = 1; 
               $('.notes',notepad.note_block).html( data );
               $('.note_line',notepad.note_block).click( 
                   function ()
                   { 
                       $(active_textarea).val( $(this).text() ); 
                   }
               );

               notepad.remind();
                                  
               notepad.note_block.draggable
               ( 
                   { 
                       handle:'.title',
                       stop: function(event, ui) 
                       {  
                           var topOff = $(this).offset().top - $(window).scrollTop();
                           notepad.note_block.css("top",topOff); 
                           storage.save('notepad_top',topOff);
                           storage.save('notepad_left',$(this).offset().left);
                       } 
                   }
               );  
                
               notepad.show();  
           }  
 
    }
    
     



     
}


var storage = {    
        
    enable:  0,   
        
    init: function () 
    {                           
        if (storage.is_enable())
        {
            storage.enable = 1;
        } 
                                     
    } ,

    is_enable: function () 
    {
        try 
        {
            return 'localStorage' in window && window['localStorage'] !== null;
        } 
        catch (e) 
        {
            return false;
        }
    } ,

    save: function (key,val) 
    {
        if (storage.enable) 
        {                             
            localStorage.setItem(key,val);
        }  
    } ,

    load: function (key,def) 
    {
        var result = def ? def : null;
   
        if (storage.enable && localStorage.getItem(key)) 
        {                  
            result = localStorage.getItem(key);
        }  
        
        return result;
    } ,

    array: {  
      
        load: function (key) 
        {  
            var result = [];
            var value = null;
                                
            value = storage.load(key);       
            value = json.parse(value);
            if (value)
                result = value;
           
            return result;
        } ,
        
        save: function (key,val) 
        {   
            storage.save(key,json.encode(val)); 
        } ,
        
        add: function (key,val) 
        {   
              
        } 
    }


}
    
// Навигация с помошью клавиатуры 
var navigate = {    
        
    enable:  0,   
        
    init: function () 
    {                           
        $('#form_post_mess').on('keypress', function()
        {
            navigate.post_form(event,this);    
        });
                                     
        $(document).on('keydown', function()
        {                                 
            navigate.through(event);    
        });
                                     
    } , 

    // Отправка сообщения по CTRL + Enter
    post_form: function (event, formElem) 
    {    
        if((event.ctrlKey) && ((event.keyCode == 10)||(event.keyCode == 13))) 
        {
            formElem.submit();    
        }
    } ,
          
    // Навигация с помошью стрелок + CTRL
    through: function (event) 
    {  
        if (window.event)
            event = window.event;

        if (event.ctrlKey)
        {                           
            var link = null;
            var href = null;
            switch (event.keyCode ? event.keyCode : event.which ? event.which : null)
            {
                case 0x25:
                    link = '#previous_page';
                    break;
                case 0x27:
                    link = '#next_page';
                    break;
                case 0x26:
                    link = '#up_page';
                    break;
                case 0x28:
                    link = '#down_page';
                    break;
                case 0x24:
                    link = '#home_page';
                    break;
            }                
            if($('a').is(link))  // alert($(link).attr('href')); return false;
                document.location = $(link).attr('href');
        }
    }  

}
   
// Установки  почты        
var mailsett = {    
        
    init: function () 
    {      
        $('#link_virt_turn').on('click',mailsett.turn_virt);
        $('#link_close_turn').on('click',mailsett.turn_close);  
    } ,    
  
    turn_virt: function () 
    {
        var text = $('#text_virt_turn').text();
        
        if (text == 'неприемлемо') 
        {
            $('#text_virt_turn').text('возможен');
            mailsett.send_virt(1);
        }
        else
        {  
            $('#text_virt_turn').text('неприемлемо'); 
            mailsett.send_virt(0); 
        } 
        
    } ,
    
    turn_close: function () 
    {
        var text = $('#text_close_turn').text();
        
        if (text == 'ограничить') 
        {
            $('#text_close_turn').text('разрешить');
            mailsett.send_close(0);
        }
        else
        {  
            $('#text_close_turn').text('ограничить'); 
            mailsett.send_close(1); 
        }
        
    } , 
    
    send_close: function (data) 
    {
        $.post( '/msett/close/', { option_mess_town: data }, onAjaxSuccess);
        function onAjaxSuccess(data) { }                    
    } ,
  
    send_virt: function (data) 
    {
        $.post( '/msett/virt/', { option_virt_accept: data }, onAjaxSuccess);
        function onAjaxSuccess(data) { }                    
    }
    
}
 

var device = {    
        
    init: function () 
    {   
                                      
    } ,

    width: function () 
    {   
        return $(window).width();                                 
    } ,

    height: function () 
    {   
        return $(window).height();  //document                               
    }  
    
        
}
      

var report = {    
         
    is_report:  0,   
        
    init: function () 
    {     
        $('#send_question').click( function () { report.show_quest() });
        $('#send_report').click( function () { report.show_report() }); 
        $('#send_reset').click( function () { report.hide() });      
        $('#report_text').unbind('click');      
                                        
        $('#hint_close').click( function () { report.hint_hide() }); 
    } ,

    show: function () 
    {                                 
        $('#report_send').off('click'); 
        $('#report_block').show('blind');                           
    } ,

    hide: function () 
    {             
        $('#report_block').hide('blind');                            
    } ,

    show_quest: function () 
    {                
        report.show();                   
        $('#report_send').val('Отправить вопрос'); 
        $('#report_send').on('click',report.post_quest);                                      
    } ,

    show_report: function () 
    {                                 
        report.show();     
        $('#report_send').val('Отправить отзыв');  
        $('#report_send').on('click',report.post_report);                                         
    } ,

    hint_show: function () 
    {               
        $("#hint_block").show('blind');                                           
    } ,

    hint_hide: function () 
    {                      
        $("#hint_block").hide('fade');                                       
    } ,
     
    post_quest: function ()
    {        
        report.hide();
        var text = $('#report_text').val();

        $.post
        (
            "/mailer/post/", 
            {
                mess: text, 
                id:   10336,   
                hash: hash
             },  
             report.on_post
         );  
        
         report.hint_show(); 
        
    } ,
     
    post_report: function ()
    {        
        report.hide();
        var text = $('#report_text').val();

        $.post
        (
            "/details.php?reviews", 
            {
                text_reviews: text, 
                hash: hash
             } 
        );  
       
        report.hint_show();
        $('#report_text').val(''); 
        
    } ,
     
    on_post: function (data)
    {                                // alert (data) 
        if( !data ) return 0;  
        var mess = JSON.parse( data );  
        
        if( mess.error == 'reload' ) 
        {  
            location.href = '/10336?text=' + encodeURIComponent($('#report_text').val());
        }        $('#report_text').val(''); 
        
    }   

} 
  

var slider = {  
 
    timer: null, 
    context: 0,
    next: 0,
        
    init: function () 
    {          
        if(!$('div').is('#top_intro_info_block'))
            return null;
         
        $('#top_intro_info_block').on('mouseover',slider.stop);
        $('#top_intro_info_block').on('mouseout',slider.start);
        
        // Предзагрузка картинок  
        setInterval(function()
        { 
            var nn = ( slider.next + 1 < 5 ) ? slider.next + 1 : 0; 
            a1 = new Image; 
            a1.src = "/img/board/top_intro_info_" + nn + ".jpg";   
        }, 10000);   
                        
    } ,  

    slide: function (num,st) 
    {
        var top_intro_caption = []
        var top_intro_context = []
         top_intro_context[0] = 'Позволит познакомиться с парнем или девушкой для секса, найти партнёра в соседнем подъезде или доме напротив. Знакомиться в собственном дворе или районе уже сегодня';
         top_intro_caption[0] = 'Уникальный способ знакомства';
         top_intro_caption[1] = 'Знакомства без регистрации';
         top_intro_context[1] = 'Начинайте использовать всё и сразу, на полную, лишь только зайдя на сайт. Без подтверждений регистрации, без активации анкет. Лёгкий и быстрый поиск новых знакомств';
         top_intro_caption[2] = 'Секс знакомства без смс';
         top_intro_context[2] = 'Ни номеров телефонов, ни подтверждений, ни смс. 100% анонимность, лёгкое и раскрепощённое общение. Онлайн обмен любыми фотографиями. E-mail адрес и всё остальное указывается по желанию';
         top_intro_caption[3] = 'Онлайн общение, интимные темы';
         top_intro_context[3] = 'То что вы хотели спросить, то о чём вы хотели поговорить. Получайте прямо сейчас. Комфортное онлайн общение, интимные беседы, уютная обстановка и приятные собеседники уже ждут вас';
         top_intro_caption[4] = 'Секс знакомства бесплатно';
         top_intro_context[4] = 'Здесь всё бесплатно. Вам доступны все сервисы сайта полностью, уже сейчас. Ваша анкета всегда наверху. Vip аккаунтов нет, открытый доступ ко всем анкетам и безграничные возможности';
 
        if( num > 4 ) num = 0;
        for (var i = 0; i<5; i++) 
        {
            $('#board_img_'+i).removeClass('show');
            $('#board_img_'+i).attr('src','');
        }
 
        $('#board_img_' + num).addClass('show active');
        $('#board_img_' + num).attr('src','/img/board/top_intro_info_'+num+'.jpg');
        if (slider.context)
        {         
            $('#top_intro_info_block_caption').text(top_intro_caption[num]);
            $('#top_intro_info_block_context').text(top_intro_context[num]); 
        }
      
        slider.next = num
    } ,

    start: function () 
    {
        slider.timer = setInterval( function(){ slider.slide(++slider.next,0)}, 20000); 
    } ,

    stop: function () 
    {
        clearTimeout(slider.timer); 
    }
    
        
}
 

var name_suggest = {    
        
    click_enable: null,
    active_elem: null,
    timer_id: null,

    init: function () 
    {                                          
        if (!$('.name_suggest').length)
            return null;
        
        $('.name_suggest').each( function (i,elem) 
        {   
            elem = $(elem);
            if (!elem.data('active'))
            {               
                elem.on('mouseover', name_suggest.enabled);
                elem.on('blur', name_suggest.blur);   
                elem.on('keyup', name_suggest.ajax_load);
                elem.attr('autocomplete','off');
                elem.wrap($('<div class="suggest_wrap">'));    
                elem.parent().append($('<div class="small_loader">')); 
                elem.parent().append($('<div class="suggest_block">'));  /**/
                elem.data('active',1) 
            }               
        });                               
                                          
    } ,
    enabled: function () 
    {                                    
        if (!$(this).data('click'))
        {                              
            $(this).on('click', name_suggest.ajax_load ); 
            $(this).data('click',1);
        }       
                               
    } ,

    ajax_load: function (elem) 
    {                                 //alert ($(this).val()); //return    data('num')
        //if (!elem) elem = this;       
        name_suggest.active_elem = $(this);  
        var name = name_suggest.active_elem.val();    
        $.post('/ajax_name.php', { name: name, hash: hash }, name_suggest.on_load); 
        /* */                              
    } ,

    on_load: function (data) 
    {                                    
        if (data)
        { 
            var mess = JSON.parse(data);  
            if (mess.names) 
            {   
                name_suggest.hide_suggest();
                name_suggest.show_suggest(mess.names); 
            } 
        }                                 
    } ,

    blur: function () 
    {                                 
        $('.suggest_block').hide('fade');                                
    } , 

    hide_suggest: function () 
    {                                
        $('.suggest_block').empty(); 
        $('.suggest_block').hide();                                
    } , 

    show_suggest: function (names) 
    {                                  
        var block_line = '';
        var block_this = name_suggest.active_elem.parent();  
        for (var i = 0; i < names.length; i++) 
        { 
            if (!names[i])
                continue; 
                
            block_line = $('<div class="suggest_line" data-name="'+names[i]+'">').text(names[i]);
            block_line.on('click',name_suggest.print);
            
            $('.suggest_block',block_this).append(block_line); 
        }   
                               
        if ($('.suggest_line',block_this).length)   
            $('.suggest_block',block_this).show();                          
    } , 
    
    print: function () 
    {                                 
        name_suggest.active_elem.val($(this).data('name')); 
        name_suggest.hide_suggest();                                
    }   
        
} 
 
  




function get_cookie ( cookie_name )
{
  var results = document.cookie.match ( '(^|;) ?' + cookie_name + '=([^;]*)(;|$)' );

  if ( results )
    return ( unescape ( results[2] ) );
  else
    return null;
}   

function del_cookie ( name ) {    
  expires = new Date(); // получаем текущую дату 
  expires.setTime( expires.getTime() - 1000 ); 
   document.cookie = name + "=; expires=" + expires.toGMTString() +  "; path=/"; 
}
function set_cookie ( name, val, time ) {   
  expires = new Date(); 
  expires.setTime( expires.getTime() + (1000 * 60 * time ) ); // минут
   document.cookie = name + "="+ val +"; expires=" + expires.toGMTString() +  "; path=/";
} 
  

var cookie_storage = {
         
    enabled: 0, 

    init: function () 
    {  

    } ,

    get_cookie: function (name) 
    {       
        var results = document.cookie.match ( '(^|;) ?' + name + '=([^;]*)(;|$)' ); 
        if (results)
          return (unescape(results[2]));
        else
          return null; 
    } ,
     
    del_cookie: function (name) 
    {              
        expires = new Date(); // получаем текущую дату 
        expires.setTime( expires.getTime() - 1000 ); 
         document.cookie = name + "=; expires=" + expires.toGMTString() +  "; path=/";  
    } ,    
    
    set_cookie: function (name,val,time) 
    {      
        expires = new Date(); 
        expires.setTime( expires.getTime() + (1000 * 60 * time ) ); // минут
         document.cookie = name + "="+ val +"; expires=" + expires.toGMTString() +  "; path=/";

    } ,  
    
    get_data: function (name) 
    {  
        var data = get_cookie(name); 
        var result = null;     
         
        if (data)   
        try 
        {
          result = JSON.parse(data);
        } 
        catch(e) { }      
        
        return result;     
    } ,  
    
    set_data: function () 
    {  

    }  
  
  

}





 
     
     
     

  $( document ).ready(function() {   
         /*     
  giper_chat.new_message ({age: "45",count_unread: "1",mess_id: "36925673",name: "Максим",reply: "",sity: "Ивантеевка",text: "Привет. Давай познакомимся.",time: "1415561723",type: "new_message",user: "699208"});
  giper_chat.new_message ({age: "45",count_unread: "1",mess_id: "36925674",name: "Николай",reply: "",sity: "Ивантеевка",text: "и дай я тебя отжарю. не пожалеешь. отсосешь мне",time: "1415561723",type: "new_message",user: "699208"});
  giper_chat.new_message ({age: "45",count_unread: "1",mess_id: "36925675",name: "Виктор",reply: "",sity: "Ивантеевка",text: "юлия а где найти анонимные объявления",time: "1415561723",type: "new_message",user: "699208"});
  giper_chat.new_message ({age: "45",count_unread: "1",mess_id: "36925676",name: "Саша",reply: "",sity: "Ивантеевка",text: "До тех пор, пока не нажата кнопка «Выход» на свою анкету можно зайти именно с этого компьютера или телефона в любое время. Если вы впервые зашли на сайт из телефона и хотите",time: "1415561723",type: "new_message",user: "699208"});
   giper_chat.new_message ({age: "45",count_unread: "1",mess_id: "36925677",name: "Саша",reply: "",sity: "Ивантеевка",text: "До тех пор, пока не нажата кнопка «Выход» на свою анкету можно зайти именно с этого компьютера или телефона в любое время. Если вы впервые зашли на сайт из телефона и хотите",time: "1415561723",type: "new_message",user: "699208"});
   giper_chat.new_message ({age: "45",count_unread: "1",mess_id: "36925678",name: "Саша",reply: "",sity: "Ивантеевка",text: "До тех пор, пока не нажата кнопка «Выход» на свою анкету можно зайти именно с этого компьютера или телефона в любое время. Если вы впервые зашли на сайт из телефона и хотите",time: "1415561723",type: "new_message",user: "699208"});
           */      
  }) ;
