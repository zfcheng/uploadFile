jQuery.extend({
    handleError: function( s, xhr, e )      {  
        if ( s.global ) {  
            (s.context ? jQuery(s.context) : jQuery.event).trigger( "ajaxError", [xhr, s, e] );  
        }
    },
    globalData: {
        formId: '',
        iFrameId: ''
    },

    main: function (options) {
        var options = jQuery.extend({}, jQuery.ajaxSettings, options);
        var id = new Date().getTime()
        var form = jQuery.createForm(id, options.fileId, options.data);
        var iFrame = jQuery.createIframe(id, options.secureuri);
        if ( options.global && ! jQuery.active++ )
        {
            jQuery.event.trigger( "ajaxStart" );
        }

        // Create the request object
        var xml = {}
        if ( options.global )
            jQuery.event.trigger("ajaxSend", [xml, options]);

        $(form).attr('method', 'POST');
        $(form).attr('action', options.url)
        $(form).attr('target', $.globalData.iFrameId);
        if(form.encoding)
        {
            form.encoding = 'multipart/form-data';
        }
        else
        {
            form.enctype = 'multipart/form-data';
        }
        $(form).submit();

        var s = options;
        function uploadCallback (){

            var io = document.getElementById($.globalData.iFrameId);

            try{
                if(io.contentWindow){
                    xml.responseText = io.contentWindow.document.body?io.contentWindow.document.body.innerHTML:null;

                }else if(io.contentDocument){
                    xml.responseText = io.contentDocument.document.body?io.contentDocument.document.body.innerHTML:null;
                }
            }catch(e){
                jQuery.handleError(s, xml, null, e);
            }

            if ( xml ){
                try {
                    var data = jQuery.uploadHttpData( xml, s.dataType );
                    if ( s.success ){
                        s.success(data);
                    }
                    // Fire the global callback
                    if( s.global )
                        jQuery.event.trigger( "ajaxSuccess", [xml, s] );
                } catch(e){
                    jQuery.handleError(s, xml, e);
                }
                // The request was completed
                if( s.global )
                    jQuery.event.trigger( "ajaxComplete", [xml, s] );

                // Handle the global AJAX counter
                if ( s.global && ! --jQuery.active )
                    jQuery.event.trigger( "ajaxStop" );

                jQuery(io).off()

                setTimeout(function()
                {   try
                    {
                        $(io).remove();
                        $(form).remove();

                    } catch(e)
                    {
                        jQuery.handleError(s, xml, null, e);
                    }

                }, 100)

                xml = null
            }
        }
        if(window.attachEvent){
            document.getElementById($.globalData.iFrameId).attachEvent('onload', uploadCallback);
        }
        else{
            document.getElementById($.globalData.iFrameId).addEventListener('load', uploadCallback, false);
        }
        return {}
    },
    createForm: function(id, fileId, data){   
        var formId = 'form_' + id;
        $.globalData.formId = formId;
        var form = $('<form  action="" method="POST" name="' + formId + '" id="' + formId + '" enctype="multipart/form-data"></form>');
        var fileElement = $('#' + fileId);
        var newFileElement = fileElement.clone();
        fileElement.before(newFileElement);
        fileElement.appendTo(form);

        if (data) { 
            for (var i in data) { 
                $('<input type="hidden" name="' + i + '" value="' + data[i] + '" />').appendTo(form);
            } 
        }
        $(form).css('position', 'absolute');
        $(form).css('top', '-2000px');
        $(form).css('left', '-2000px');
        $(form).appendTo('body');
        return form;
    },
    createIframe: function(id, uri){
        var iFrameId = 'iFrameId_' + id;
        $.globalData.iFrameId = iFrameId;
        if(window.ActiveXObject) {
            var elem = document.createElement('<iframe id="' + iFrameId + '" name="' + iFrameId + '" />');
            if(typeof uri== 'boolean'){
                elem.src = 'javascript:false';
            }
            else if(typeof uri== 'string'){
                elem.src = uri;
            }
        }
        else {
            var elem = document.createElement('iframe');
            elem.id = iFrameId;
            elem.name = iFrameId;
        }
        elem.style.position = 'absolute';
        elem.style.top = '-1000px';
        elem.style.left = '-1000px';
        document.body.appendChild(elem);
        return elem;
    },
    uploadHttpData: function( r, type ) {
        if(!type) {  type = 'json'; }
        if ( type == "json" ){
            var data = r.responseText;
            var rx = new RegExp("<pre.*?>(.*?)</pre>","i");
            var am = rx.exec(data);

            var data = (am) ? am[1] : "";    //the only submatch or empty
            eval( "data = " + data );
        }
        return data;
    }
})
