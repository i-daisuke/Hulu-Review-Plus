//API URL
var apiJaURL = "http://flipclap.com/hulu-review-plus/review_ja.php";
var apiEnURL = "http://flipclap.com/hulu-review-plus/review_en.php";
/* --- 初期変数 ---*/
var footCloseHeight = 20;
var footOpenHeight = 210;
var footOpenSpeed = 500;
 //ボタンのテキスト
var btnOpen = "OPEN";
var btnClose = "CLOSE";
//ドメイン
var domain = "";
//extentionフォルダから読み込み
var progSrc = chrome.extension.getURL("images/ajax-loader.gif"); 
//static
var cookie = new Cookie();
var amazon = new Amazon();


$(document).ready(function(){
	
	/* * * * * *
	* ページを判定して関数実行
	* * * * * */
	var u = new Url();
	var urls = u.getUrlArray();
	domain = urls[0]
	//URLにwatchがあればムービーページ
	if ( urls[1] == "watch" ){
		initWatch();
	}

});




/* * * * * *
ムービーページ
* * * * * */
function initWatch(){
		
	//開閉エリアのHTML配置
	$("body").append('<div id="exFoot"><a id="btnWindow"></a><div id="langArea"><ul><li id="selectJa">Japanese</li><li id="selectEn">English</li></ul></div><div id="exResult"></div></div>');	
	
	//css
	$('html,body').animate({ scrollTop: 68 }, 'slow');
	$("#exFoot").css("height",footOpenHeight);
	
	//Huluの文字を削除したtitle取得
	var keyStr  = $('title').text();
	var keyStr = replaceAll(keyStr, "Hulu - ", ""); 
	var keyStr = replaceAll(keyStr, " - Watch the full movie now.", ""); 
	var key = replaceAll(keyStr, " - Hulu", ""); 
	var indexOf = key.indexOf(":"); 
	if ( indexOf != -1){
		key = key.slice(0,indexOf);
	}

	//Lang状況
	var lang = cookie.get('selectedLang');
	//初期判定
	if ( stat == undefined && domain == 'www.hulu.jp') {
		cookie.set('selectedLang','ja');
	}
	else if (stat == undefined && domain == 'www.hulu.com'){
		cookie.set('selectedLang','en');
	}
	//jaなら
	if ( lang == 'ja') {
		//html整形
		$('#selectJa').addClass('selected');
		$('#selectEn').removeClass('selected');
		//amazon api
		amazon.setApiURL(apiJaURL);
	}
	//en
	else if ( lang == 'en' || stat == undefined) {
		//html整形
		$('#selectEn').addClass('selected');
		$('#selectJa').removeClass('selected');
		//amazon api
		amazon.setApiURL(apiEnURL);
	}
	
	
	//window状況
	var stat = cookie.get('stateWindow');
	//closeなら
	if ( stat == 'close') {
		$('#exResult').hide();
		$('#exFoot').css("height",footCloseHeight);
		$('#btnWindow').text(btnOpen);//テキスト変更
	}
	//openなら
	else if ( stat == 'open' || stat == undefined) {
		$('#exResult').show();
		$('#exFoot').css("height",footOpenHeight);
		$('#btnWindow').text(btnClose);//テキスト変更
		//レビュー読み込み
		amazon.readReview(key);
	}
	

	//開閉ボタン
	$('#btnWindow').click(function(){

		//開いてるなら
		if( $('#exResult').css("display") =="block" ){
			$('#exResult').hide();
			$('#exFoot').animate({height:footCloseHeight},footOpenSpeed);
			$('#btnWindow').text(btnOpen);//テキスト変更
			//cookieセット
			cookie.set('stateWindow','close');
		}
		//閉じてるなら
		else if( $('#exResult').css("display") =="none" ){
			$('#exResult').show();
			$('#exFoot').animate({height:footOpenHeight},footOpenSpeed);
			$('#btnWindow').text(btnClose);//テキスト変更
			//レビュー読み込み
			amazon.readReview(key);
			//cookieセット
			cookie.set('stateWindow','open');
		}
	});
	
	
	//言語選択ボタン
	$('#selectJa').click(function(){
		//html整形
		$('#selectJa').addClass('selected');
		$('#selectEn').removeClass('selected');
		//cookie
		cookie.set('selectedLang','ja');
		//amazon api
		amazon.setApiURL(apiJaURL);
		//レビュー読み込み
		amazon.readReview(key);
	});
	$('#selectEn').click(function(){
		//html整形
		$('#selectEn').addClass('selected');
		$('#selectJa').removeClass('selected');
		//cookie
		cookie.set('selectedLang','en');
		//amazon api
		amazon.setApiURL(apiEnURL);
		//レビュー読み込み
		amazon.readReview(key);
	});

}



/* * * * * *
Common Functions
* * * * * */
// 全ての文字列 s1 を s2 に置き換える
function replaceAll(expression, org, dest){
	return expression.split(org).join(dest);
}

//stars
function starImage(){
	
	//画像取得
	var star0_0 = chrome.extension.getURL("images/s_star_0_0.png");
	var star1_0 = chrome.extension.getURL("images/s_star_1_0.png");
	var star2_0 = chrome.extension.getURL("images/s_star_2_0.png");
	var star3_0 = chrome.extension.getURL("images/s_star_3_0.png");
	var star4_0 = chrome.extension.getURL("images/s_star_4_0.png");
	var star5_0 = chrome.extension.getURL("images/s_star_5_0.png");
	
	//html整形
	$('.swSprite span').hide();
	$('.s_star_0_0').append('<img class="starImg" src="'+star0_0+'" />');
	$('.s_star_1_0').append('<img class="starImg" src="'+star1_0+'" />');
	$('.s_star_2_0').append('<img class="starImg" src="'+star2_0+'" />');
	$('.s_star_3_0').append('<img class="starImg" src="'+star3_0+'" />');
	$('.s_star_4_0').append('<img class="starImg" src="'+star4_0+'" />');
	$('.s_star_5_0').append('<img class="starImg" src="'+star5_0+'" />');
	
}


/* * * * * *
Class Amazon
* * * * * */
function Amazon(){

	var _apiURL = '';
		
	//Amazon Review
	this.readReview = function(key){
		
		//ローダー表示
		$('#exResult').html("");
		$("#exResult").append('<img id="prog" src="'+progSrc+'" alt="" style="display:none;" />');
		$('#prog').show();
		
		$.ajax({
			url: _apiURL,
			type: "GET",
			data: {
			  key:key,
			 },
			success: function(data, status){
				$('#prog').hide();//ローダー非表示
				var json = eval("("+data+")");
				$('#exResult').html(json.outertex);
				starImage();//星画像配置
			},
			error: function(data){
				$('#exResult').html('sorry!  :(' );
			}	
		});

	}
	
	//set
	this.setApiURL = function(url){
		_apiURL = url;
	}
	
	//get
	this.getApiURL = function(){
		return _apiURL
	}

}


/* * * * * *
Class Url
* * * * * */
function Url(){

	//URLのパラメーター取得
	this.getUrlVars = function() { 
	    var vars = [], hash; 
    	var hashes = window.location.href.slice(window.location.href.indexOf('?') + 1).split('&'); 
    	for(var i = 0; i < hashes.length; i++) { 
        	hash = hashes[i].split('='); 
	        vars.push(hash[0]); 
    	    vars[hash[0]] = hash[1]; 
	    } 
    	return vars; 
	}
	
	//URLをスラッシュ区切りで配列に
	this.getUrlArray = function(){
		var url = document.URL;
		url = url.split("http://").join(""); //http://を削除
		url = url.split('/');
		return url;
	}
	
}


/* * * * * *
Class Cookie
* * * * * */
function Cookie() {
	
	//プライベート
	var _deadtime = 48;//期限48時間
	
	//読み込み｜ex：http://blog.wonder-boys.net/?p=208
	this.get = function(value){
		if(value){
			var c_data = document.cookie + ";";
			c_data = unescape(c_data);
			var n_point = c_data.indexOf(value);
			var v_point = c_data.indexOf("=",n_point) + 1;
			var end_point = c_data.indexOf(";",n_point);
			if(n_point > -1){
				c_data = c_data.substring(v_point,end_point);
				//alert("cookieは" + c_data + "です");
				return c_data;
			}
		}
	}

	//書き込み
	this.set = function(cookie_name,value){
		var ex = new Date();
		ex.setHours(ex.getHours() + _deadtime);
		ex = ex.toGMTString();
		var c = escape(cookie_name) + "=" + escape(value) + ";expires=" + ex;
		document.cookie = c;
	}
	
}
