
   
$( document ).ready(function() 
{                 
    idea_list.init(); 
    comm_list.init();  
    revs_list.init();  
});



// -- Список контактов ---
var idea_list = {
     
    init: function () 
    {         
        $('.rating_up').on('click',idea_list.ajax.up); 
        $('.rating_down').on('click',idea_list.ajax.down); 
    } , 
    
    ajax: {   
    
        up: function () 
        {           
            var id  = $(this).data('num'); 
            $(this).off('click');
            $.post( '/develop/modidea/', { id: id, mod: 1 } );
            idea_list.actions.mod(id,1);  
        } ,  
    
        down: function () 
        {            
            var id  = $(this).data('num');  
            $(this).off('click');
            $.post( '/develop/modidea/', { id: id, mod: -1 } ); 
            idea_list.actions.mod(id,-1);   
        }      
          
    } ,
 
    actions: {
    
        mod: function (id,mod) 
        {          
            var rank = $('#idea_rank_'+id).text() * 1 + mod;
            var vote = $('#idea_vote_'+id).text() * 1 + 1;
            $('#idea_rank_'+id).text(rank); 
            $('#idea_vote_'+id).text(vote);       
        }  
        
    } ,
 
    options: {  
         
        updater: {  
            
            show: function () 
            {          
                $('#contact_update').show('fade');       
            } , 
            
            hide: function () 
            {          
                $('#contact_update').hide('fade');       
            }   
        } 
     
    } 
}     

// -- Список комментариев ---
var comm_list = {
     
    init: function () 
    {         
        $('.comm_up').on('click',comm_list.ajax.up); 
        $('.comm_down').on('click',comm_list.ajax.down); 
    } , 
    
    ajax: {   
    
        up: function () 
        {           
            var id  = $(this).data('num'); 
            $(this).off('click');
            $.post( '/develop/modcomm/', { id: id, mod: 1 } );
            comm_list.actions.mod(id,1);  
        } ,  
    
        down: function () 
        {            
            var id  = $(this).data('num');  
            $(this).off('click');
            $.post( '/develop/modcomm/', { id: id, mod: -1 } ); 
            comm_list.actions.mod(id,-1);   
        }      
          
    } ,
 
    actions: {
    
        mod: function (id,mod) 
        {          
            var rank = $('#comm_rank_'+id).text() * 1 + mod;
            var vote = $('#comm_vote_'+id).text() * 1 + 1;
            $('#comm_rank_'+id).text(rank); 
            $('#comm_vote_'+id).text(vote);       
        }  
        
    } 
} 

// -- Список отзывов ---
var revs_list = {
     
    init: function () 
    {         
        $('.revs_up').on('click',revs_list.ajax.up); 
        $('.revs_down').on('click',revs_list.ajax.down); 
    } , 
    
    ajax: {   
    
        up: function () 
        {           
            var id  = $(this).data('num'); 
            $(this).off('click');
            $.post( '/security/modrevs/', { id: id, mod: 1 } );
            revs_list.actions.mod(id,1);  
        } ,  
    
        down: function () 
        {            
            var id  = $(this).data('num');  
            $(this).off('click');
            $.post( '/security/modrevs/', { id: id, mod: -1 } ); 
            revs_list.actions.mod(id,-1);   
        }      
          
    } ,
 
    actions: {
    
        mod: function (id,mod) 
        {          
            var rank = $('#revs_rank_'+id).text() * 1 + mod;
            var vote = $('#revs_vote_'+id).text() * 1 + 1;
            $('#revs_rank_'+id).text(rank); 
            $('#revs_vote_'+id).text(vote);       
        }  
        
    } 
} 
