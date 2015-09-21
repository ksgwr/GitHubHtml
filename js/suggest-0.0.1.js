/*
 suggest.js
 This software is released under the MIT License,

 Copyright (c) 2015 ksgwr
 Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

 The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

 THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
 */
(function($) {
    // focus中にFieldをinterval[ms]毎に監視しcallbackする
    $.fn.observeValue = function(callback, options) {
        var default_options = {
            interval: 100
        };
        options = $.extend(default_options, options || {});

        return this.each(function(){
            if(typeof this.value == 'undefined') return;
            var tid;
            var self = this;
            var elm = $(self);

            elm.focus(function(e){
                callback.call(self, elm.val(), e);
                tid = setInterval(function(){
                    callback.call(self, elm.val());
                }, options.interval);
            });
            elm.blur(function(e){
                clearInterval(tid);
                callback.call(self, elm.val(), e);
            });
        });
    };

    // 値がwatchInterval*callInterval[ms]変更なかった場合にイベントが発生する
    // 値の変更監視の機能が追加されたobserveValueの拡張
    $.fn.observeValueDelay = function(callback, options){
        var default_options = {
            callInterval    : 1, // callInterval回だけ値が変わらなかったらイベントが発生する(入力途中で無駄にイベントを発生させないため)
            watchInterval     : 100, // 監視秒数 default 100 msec
            terminal : false //開始・終了時にイベントを呼び出すかどうか(入力補助利用なら不必要で、値監視なら必要になる可能性）
        };
        options = $.extend(default_options, options || {});
        var childOptions = {interval:options.watchInterval};

        return this.each(function(){
            var callInterval = options.callInterval;
            var cnt = callInterval + 1; //初期化させるためにcnt>callIntervalに設定
            var self = this;
            var elm = $(self);
            var tmpValue = elm.val(); //監視中の値
            var callValue = tmpValue; //前回call時の値
            elm.observeValue(function(value, e){
                //focus,blur時の強制呼び出し
                if(options.terminal==true && e!=undefined){
                    callback.call(self, value, e);
                    tmpValue = value;
                    cnt=0;
                    return;
                }
                if(cnt==callInterval){
                    if(callValue!=value){
                        callValue = value;
                        callback.call(self, value, e);
                    }
                    cnt=0;
                }else{
                    //値が一緒だとカウントアップ
                    if(tmpValue==value){
                        if(cnt<=callInterval){
                            cnt++;
                        }
                    }else{
                        tmpValue = value;
                        cnt=0;
                    }
                }
            }, childOptions);
        });
    };


/**
 * suggest仕様検討 (require jQuery 1.7~)
 * $("input:text"),suggest(jsonObj)
 * jsonObj
 *      ($,ajaxに渡すパラメータ)
 *      url:
 *      createRequestData: function (省略時はinput:name=valueでリクエストを作成） 戻り値にrequestのHashObject
 *      createSuggests: function(data, value) 戻り値にsuggestsのArrayObject
 *          data: 元データ、URLから受け取ったデータ
 *          value: 入力テキスト
 *      dataType: urlのdataType (省略時はundefined, 'json','xml' など)
 *
 *      data:   (if:array dataObject set data in change function)
 *      validate:function() クエリチェックを行う、falseならsuggestしない。ajaxに送るデータを制限するために利用。
 *
 *      change:function( suggests, data, event )
 *          suggests: 候補配列、値を変更し候補に反映できる suggestが空ならsuggestしない
 *          data:     元データ、URLから受け取ったデータ
 *          event:     jQuery event or undefined
 *      eventOnly : true changeイベント発生のみ（候補を表示しない） observeValueDelayに簡易ajaxを付けたもの(tableを追加しない）
 *      beforeShow : function ( table, suggests ) table表示前、カスタマイズ可能にする
 *
 *      determine:function(event) 候補決定時、defaultならclosestのformをsubmit
 *
 *      callInterval : 監視間隔 default:1
 *      watchInterval : 監視時間 default: 100 msec
 *      terminal : フォーカス時の初期化
 *
 *      hideBlur : blur時にウィンドウを消す, default: false
 *
 * ToDo
 *      候補生成時のメソッドの拡張、やりたいのならemptySuggests:trueで候補を自分で生成すればよい？ success部分など
 *      observeValueDelayを使う必要がある？observeValueだけでいいのでは？あるならオプションの実装
 *      ajax success時のパーサーがオプション化されていない、ajaxのオプションをなるべく一般化して渡せるようにしたい
 *      Tableのcss仕様の調整
 */
$.fn.suggest = function(settings){
    var input = $(this);

    var default_options = {
        hideBlur : false
    };
    settings = $.extend(default_options, settings || {});

    var isMouseDown = false; //tableクリックを感知する
    var isSelecting = false; //table選択中の判定
    var latestInput; //table生成時の元データ

    var isLocal; //ajax利用するかどうか
    var data;
    if(settings.data instanceof Array){
        isLocal = true;
        data = settings.data;
    }else{
        isLocal = false;
    }

    //Typeofの回数を減らして高速化
    var isValidate = typeof(settings.validate) == 'function' ? true : false;
    var isChange = typeof(settings.change) == 'function' ? true : false;
    var isBeforeShow = typeof(settings.beforeShow) == 'function' ? true : false;

    if(settings.url && typeof(settings.createRequestData) != 'function'){
        //request作成関数 default実装
        settings.createRequestData = function(){
            var obj = {};
            var jThis = $(this);
            var attr = jThis.attr('name') ? jThis.attr('name') : jThis.attr('id');
            obj[attr] = jThis.val();
            return obj;
        }
    }

    if(typeof(settings.createSuggests) != 'function') {
        // 候補生成のdefault実装,
        var createSuggestsDefault = function(data, value) {
            var suggests = [];
            for(var i=0;i<data.length;i++){
                if(value != "" && data[i].indexOf(value)>=0){
                    suggests.push(data[i]);
                }
            }
            return suggests;
        };
        // ajax利用のdefault実装。改行コードで区切られたTextを想定
        if(settings.url) {
            settings.createSuggests = function(data) {
                return createSuggestsDefault(data.split("\n"));
            }
        } else if(isLocal) {
            // localのデフォルト実装
            settings.createSuggests =  createSuggestsDefault;
        }
    }

    //Table生成
    if(!settings.eventOnly){
        // determineのdefault実装
        if(typeof(settings.determine)!='function'){
            settings.determine = function(){
                $(this).closest('form').submit();
            }
        }

        var settingTable = function(jtable,input){
            //init
            var iWidth = input.outerWidth();
            var iHeight = input.outerHeight();
            var iOffset = input.offset();
            var iTop = iOffset.top + iHeight;
            var iLeft = iOffset.left;
            jtable.css({
                'width' : iWidth,
                'top' : iTop,
                'left': iLeft
            });
        }

        // tableのCSS、暫定実装
        var table = $('<table>').css({
            'position' : 'absolute',
            'display':'none'
        }).addClass('suggest');
        settingTable(table,input);
        var tbody = $('<tbody>').appendTo(table);

        //Table挿入
        input.after(table);

        //tr live on登録
        $(tbody).on({
            'mouseenter':function(){
                $('tr.on',tbody).removeClass('on');
                $(this).addClass('on');
            },
            'mouseleave':function(){
                $(this).removeClass('on');
            },
            'click':function(e){
                table.hide();
                input.val($(this).text()).focus();
                settings.determine.apply(this, [e]);
                isMouseDown = false;
            },
            'mousedown':function(){
                //input blur時点でマウスのクリックを感知する
                isMouseDown = true;
            }
        },'tr');
    };

    //イベント発生時の処理の定義
    var callSuggest = function(value, event){

        if(isSelecting){
            //候補選択動作が終了した場合、ここ適当。効率をよく出来るし、ロジックも考慮できる
            //console.log("isSelecting latest:",latestInput, "onTr:",onTr.text(), "input:",input.val());
            var onTr = $('tr.on', tbody);
            //console.log("change input:"+input.val()+",latestInput:"+latestInput+",onTr:"+onTr.text());
            if (latestInput == input.val() || onTr.text() == input.val()) {
                return ;
            }else{
                isSelecting = false;
            }
        }

        /*if(event!=undefined && event.type=='blur'){
         return;
         }*/
        //入力チェック
        if(isValidate){
            var ok = settings.validate.apply(this);
            if(ok===false){return;}
        }

        //簡易候補生成
        var suggests = [];
        //var ajaxFinished = true;

        // suggests候補を作った後に呼ぶ関数
        var afterAjax = function(){
            if(isChange){
                settings.change.apply(this,[suggests, data, event]); //this==input.text
            }

            if (!settings.eventOnly) {
                tbody.empty();
                if (suggests.length <= 0) {
                    table.hide();
                    return;
                }
                for (var i = 0; i < suggests.length; i++) {
                    var td = $('<td>').text(suggests[i]);
                    $('<tr>').append(td).appendTo(tbody);
                }

                //Tableの配置
                settingTable(table,input);
                if (isBeforeShow) {
                    settings.beforeShow.apply(this, [table, suggests]); //this==input.text
                }
                table.show();
            }
            //console.log(suggests,data);
        }

        if(settings.url){
            $.ajax({
                url: settings.url,
                data: settings.createRequestData.apply(input),
                dataType: settings.dataType,
                context: {input:input, value:value},
                success:function(data){
                    //候補生成、改行コードであてるだけなのでオプションで拡張できたほうがよい。
                    suggests = settings.createSuggests.apply(this.input, [data, this.value]);
                },
                complete:function(){
                    afterAjax.apply(this.input);
                }
            });
        }else{
            if (isLocal) {
                suggests = settings.createSuggests.apply(input, [data, value]);
            } else {
                suggests = [];
            }
            afterAjax.apply(input);
        }
        //while(!ajaxFinished){} //complete sleep

    };

    input.observeValueDelay(callSuggest, settings);
    // tableの操作
    if (!settings.eventOnly) {
        //keydownはcallSuggestより前に呼ばれるが入力前なため値の変化は感知できない
        input.keydown(function (e) {
            //要素をセレクトしたら次のキー入力までキーワード入力補助を発動させない方が良い
            //40==下、38==上、39==右、13==Enter
            var keyCode = e.keyCode ? e.keyCode : e.which;
            var selectElm = null;
            var onTr = $('tr.on', tbody);
            //console.log(e);
            if (onTr.length > 0) {
                //選択中の項目が存在する
                var init = true;
                if (keyCode == 40) {
                    selectElm = onTr.next('tr');
                } else if (keyCode == 38) {
                    selectElm = onTr.prev('tr');
                } else if (keyCode == 13) {
                    //候補選択時
                    input.val(onTr.text());
                    settings.determine.apply(this, [e]);
                    table.hide();
                } else {
                    init = false;
                }
                if (init) {
                    onTr.removeClass('on');
                }
            } else {
                //選択中の項目が存在しない
                var init = true;
                if (keyCode == 40) {
                    if (table.is(':visible')) {
                        selectElm = $('tr:first', tbody);
                    } else {
                        callSuggest.apply(this, [input.val()]);
                        //table.show();
                    }
                } else if (keyCode == 38) {
                    if (table.is(':visible')) {
                        selectElm = $('tr:last', tbody);
                    }
                } else if (keyCode == 39) {
                    selectElm = $('tr:first', tbody);
                } else {
                    init = false;
                }
                if (init) {
                    latestInput = input.val();
                    isSelecting = true;
                }
            }
            if (selectElm != null) {
                if (selectElm.length > 0) {
                    var text = selectElm.addClass('on').text();
                } else {
                    var text = latestInput;
                }
                input.val(text);    //textが変化するのでobserveValueが変化してしまう
                return false; //上カーソルで先頭に動くのを回避
            }
        });
        if(setting.hideBlur) {
            input.blur(function () {
                if (!isMouseDown) {
                    table.hide();
                }
            });
        }
    }
};
})(jQuery);