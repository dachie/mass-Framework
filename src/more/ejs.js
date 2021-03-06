$.define("ejs", "lang",function(){
    //用法如如ASP，JSP，ruby的ERB, 完全没有入门难度
    //不过太过自由写意，让用户任意在HTML镶嵌逻辑容易造成维护灾难
    //使用者请自行约束
    //http://www.cnblogs.com/rubylouvre/archive/2012/03/19/2405867.html
    var
    _startOfHTML = "\t__views.push(",
    _endOfHTML = ");\n",
    sRight = "&>",
    rLeft = /\s*<&\s*/,
    rRight = /\s*&>\s*/,
    rAt = /(^|[^\w\u00c0-\uFFFF_])(@)(?=\w)/g,
    rLastSemi = /[,;]\s*$/
    var ejs2 = $.ejs = function(id,data,doc){
        data = data || {};
        if( !ejs2[id] ){
            var rleft = rLeft,
            rright = rRight,
            sright = sRight,
            rlastSemi = rLastSemi,
            startOfHTML = _startOfHTML,
            endOfHTML = _endOfHTML, str , logic,
            doc = doc || document,
            el = $.query ? $(id, doc)[0] : doc.getElementById(id);
            if (!el) throw "can not find the target element";
            str = el.innerHTML;
            if(!(/script|textarea/.test(el.tagName))){
                str = $.String.unescapeHTML(str);
            }
            
            var arr = str.trim().split(rleft),
            buff = ["var __views = [];\n"],temp = [],i = 0,n = arr.length,els,segment;

            while(i < n){//逐行分析，以防歧义
                segment = arr[i++];
                els = segment.split(rright);
                if( ~segment.indexOf(sright) ){//这里不使用els.length === 2是为了避开IE的split bug
                    switch ( els[0].charAt(0) ) {
                        case "="://处理后台返回的变量（输出到页面的);
                            logic = els[0].substring(1);
                            if(logic.indexOf("@")!==-1){
                                temp.push( startOfHTML, logic.replace(rAt,"$1data.").replace(rlastSemi,''), endOfHTML );
                            }else{
                                temp.push( startOfHTML, logic.replace(rlastSemi,''), endOfHTML );
                            }
                            break;
                        case "#"://处理注释
                            break;
                        default://处理逻辑
                            logic = els[0];
                            if(logic.indexOf("@")!==-1){
                                temp.push( logic.replace(rAt,"$1data."), "\n" );
                            }else{
                                temp.push( logic, "\n" );
                            }
                    }
                    //处理静态HTML片断
                    els[1] &&  temp.push(startOfHTML, $.quote( els[1] ), endOfHTML)
                }else{
                    //处理静态HTML片断
                    temp.push(startOfHTML, $.quote( els[0] ), endOfHTML );
                }
            }

            ejs2[id] = new Function("data",buff.concat(temp).join("")+';return __views.join("");');
            return  ejs2[id]( data )
        }
        return  ejs2[id]( data )
    }
})
// ejs v9!
//https://github.com/leizongmin/tinyliquid http://cdc.tencent.com/?p=5723