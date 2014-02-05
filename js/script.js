localStorage.ucVersion = "1.7.0";

var isGingerbread = /android 2\.3/i.test(navigator.userAgent);

console.log("navigator.language", navigator.language);
//language
var langCurrent = "en";
if (navigator.language.toLowerCase() == "zh-cn") {
	langCurrent = "cn";
}
function lang(key, ele) {
	if (ele) {
		$(ele).html(langData[langCurrent][key]);
	} else {
		return langData[langCurrent][key];
	}
}

$("#web-app-title").attr("content", lang("title"));
//lang("title", "title"); android 2.3 Error: NO_MODIFICATION_ALLOWED_ERR: DOM Exception 7
lang("title", "#mod-top-bar__title");
lang("menuReadme", "#mod-menu-readme");
lang("menuFeedback", "#mod-menu-feedback");
lang("menuWiki", "#mod-menu-wiki");
lang("start", "#mod-clock__digit");
lang("startHint", "#mod-clock__status");
lang("frequencyUnit", "#mod-chart__mark_x");
lang("duration", "#mod-chart__mark_y");
lang("averageTitle", "#mod-average__title");
lang("time", "#mod-average__time");
lang("averageDuration", "#mod-average__duration");
lang("averageFrequency", "#mod-average__frequency");
lang("close", "#mod-readme-close");
lang("readmeColor", "#mod-readme-color");
lang("readmeColorDetail", "#mod-readme-color-detail");
lang("readmeUnit", "#mod-readme-unit");
lang("readmeUnitDetail", "#mod-readme-unit-detail");
lang("readmeUsage", "#mod-readme-usage");
lang("readmeUsageDetail", "#mod-readme-usage-detail");


//init layout


var ucCountStatus = parseInt(localStorage.ucCountStatus);//避免进程被日...
//console.log("ucCountStatus", ucCountStatus);

var intClientHeight, intClientWidth, ucStartTime = 0;


// Check if a new cache is available on page load.
window.addEventListener('load', function (e) {

	window.applicationCache.addEventListener('updateready', function (e) {
		if (window.applicationCache.status == window.applicationCache.UPDATEREADY) {
			// Browser downloaded a new app cache.
			// Swap it in and reload the page to get the new hotness.
			window.applicationCache.swapCache();
			window.location.reload(true);
			console.log("new version,reloading");
		} else {
			// Manifest didn't changed. Nothing new to server.
		}
	}, false);

}, false);

function hasTouchDevice() {
	return 'ontouchstart' in window // works on most browsers
		|| 'onmsgesturechange' in window; // works on ie10
}

isTouchDevice = hasTouchDevice();

function setTitle(str) {
	$("#mod-top-bar__title").text(str);
}
function addZero(num) {
	if (num < 10) {
		num = "0" + num;
	} else if (num > 60) {
		num = "60+"
	}
	return num;
}

function initLayout() {
	if (isGingerbread) {/*android 2.3 fucked*/
		$("body").addClass("isGingerbread");
		console.log("isGingerbread");
	}
	$("#mod-menu-feedback").click(function () {
		window.location.href = "mailto:i@bigc.at";
	});
	setTitle(lang("title") + " v" + localStorage.ucVersion);
	intClientHeight = document.documentElement.clientHeight;
	intClientWidth = document.documentElement.clientWidth;
	var data = getData();
	if (data.length > 0) {
		upDate();
		$("body").addClass("hasData");
	}
	if (!localStorage.ucReadme == 1) {
		$(".mod-readme").show().css("opacity", "1");
		localStorage.ucReadme = 1;
	}
	if (localStorage.hasOwnProperty("ucCountStatus") && localStorage.ucCountStatus == 1) {
		ucStartTime = +new Date(parseInt(localStorage.ucStartTime));/* + calls valueOf() */
		ucCountStart(ucStartTime);
		console.log("resume from localStorage");
	} else {
		localStorage.ucCountStatus = 0;
	}
}
function getTimeString(millSec) {
	return new Date(millSec).toLocaleTimeString();
}


// fetch data from localStorage
function getData() {
	var dataStr = localStorage.getItem("ucData");
	var data = JSON.parse(dataStr);
	if (data == null) {
		data = [];
	}
	return data;
}
function setData(data) {
	var dataStr = JSON.stringify(data);
	localStorage.setItem("ucData", dataStr);

}

function getTimeGap(stamp1, stamp2) {
	var d1 = new Date(stamp1);
	var d2 = new Date(stamp2);
	var d3 = d1 - d2;
	return parseInt(d3 / 1000);
}
function getLastTimeGap(startTime) {
	var data = getData();
	var timeGap = 0;
	if (data.length > 0) {
		timeGap = getTimeGap(startTime, data[0].stopTime);
		if (timeGap < 60) {
			setMsg(lang("lessThan1min"));
			return false;
		}
	}
	return timeGap;
}
function createLocalUc(startTime, stopTime) {
	var data = getData();
	var timeLength = parseInt((stopTime - startTime) / 1000);
	var lastTimeGap = getLastTimeGap(startTime);
	if (lastTimeGap === false) {
		return
	}
	
	var newUc = {
		"startTime" : startTime,
		"stopTime"  : stopTime,
		"timeLength": timeLength,
		"timeGap"   : lastTimeGap
	};
	console.log("newUc",newUc);
	data.unshift(newUc);
	setData(data);
	upDate();
}
function deleteLocalUc(index) {
	var data = getData();
	data.splice(index, 1);
	setData(data);
	upDate();
}
function formatTimeStamp(timestamp) {
	var date = new Date(timestamp);
	return addZero(date.getHours()) + ":" + addZero(date.getMinutes()) + ":" + addZero(date.getSeconds());
}
function formatSec(sec) {
	sec = parseInt(sec);
	var min = parseInt(sec / 60);
	var sec = sec % 60;
	var minStyle = addZero(min);
	if (minStyle == "00") {
		minStyle = "<span class='ui-color_white-alpha'>00</span>"
	}
	return  minStyle + ":" + addZero(sec);
}
function getStatus(sec) {
	var min = sec / 60;
	if (min < 6) {
		return "alarm"
	} else if (min < 11) {
		return "warning"
	}
	return "default";
}

function deleteAll() {
	localStorage.removeItem("ucData");
	upDate();
	window.location.reload(true);
	/*ignore any cached */
}
function updatePageTable(times) {
	console.log("updatePageTable()");
	var data = getData();
	var groupDate, trTitle;
	var table = $("#mod-list__table");
	table.find("tr").remove();
	function createTd(str) {
		var td = $.create("td", {html: str});
		td.attr("class", "mod-list__td")
		td.appendTo(tr);
	}

	function createTrTitle(str) {
		var td = $.create("td", {html: str});
		var tr = $.create("tr", {html: ""});
		td.attr({"class": "mod-list__td", "colspan": 4});
		tr.attr("class", "mod-list__tr-title");
		td.appendTo(tr);
		return tr;
	}

	function createTrMore(str) {
		var td = $.create("td", {html: str});
		var tr = $.create("tr", {html: ""});
		td.attr({"class": "mod-list__td", "colspan": 4});
		tr.attr("class", "mod-list__tr-more ui-font-size_small");
		td.appendTo(tr);
		return tr;
	}

	if (!times) {
		times = data.length
	}
	if (data.length < times) {
		times = data.length;
	}
	for (var i = 0; i < times; i++) {
		trTitle = createTrTitle(new Date(data[i].startTime).toLocaleDateString());

		if (i == 0) {
			trTitle.appendTo(table);
			groupDate = new Date(data[i].startTime).getDate();
		}
		if (new Date(data[i].startTime).getDate() != groupDate) {
			trTitle.appendTo(table);
			groupDate = new Date(data[i].startTime).getDate();
		}
		var tr = $.create("tr", {html: ""});
		tr.attr({"class": "mod-list__tr", "data-index": i});
		tr.appendTo(table);

		var className = "ui-color_" + getStatus(data[i].timeGap);
		createTd('<div class="ui-font-size_x-small">' + lang("start") + '</div>' + formatTimeStamp(data[i].startTime) + '<div class="ui-color_white-alpha ui-font-size_x-small">' + formatTimeStamp(data[i].stopTime) + ' ' + lang("stop") + '</div>');
		createTd('<td class="mod-list__td"><div class="ui-font-size_x-small">' + lang("duration") + '</div>' + formatSec(data[i].timeLength) + '</td>');
		createTd('<td class="mod-list__td"><div class="ui-font-size_x-small">' + lang("frequency") + '</div><span class="' + className + '">' + formatSec(data[i].timeGap) + '</span></td>');
	}
	if (data.length != times) {
		var trMore = createTrMore(lang("recordAllShow"));
		trMore.click(function () {
			updatePageTable()
		});
		trMore.appendTo(table);
	} else {
		var trMore = createTrMore(lang("recordAllDelete"));
		trMore.click(function () {
			if (confirm(lang("recordAllDeleteConfirm"))) {
				deleteAll();
			}
		});
		trMore.appendTo(table);
	}

	$(".mod-list__tr").click(function () {
		$(this).addClass("mod-list__tr_active");
		if (confirm(lang("recordDeleteConfirm"))) {
			deleteLocalUc($(this).attr("data-index"));
			console.log("delete ", $(this).attr("data-index"));
		}
		$(this).removeClass("mod-list__tr_active");
	});

}
var ucStopTime = 0,
	ucCounter = 1, ucInteval;
function ucCountStart(ucStartTime_recover) {
	console.log("ucCountStart()", ucStartTime_recover);
	if (ucStartTime_recover == undefined) {
		ucStartTime = +new Date();
		localStorage.ucStartTime = ucStartTime;
		var lastTimeGap = getLastTimeGap(ucStartTime);
		console.log("lastTimeGap", lastTimeGap);
		if (lastTimeGap === false) {
			return
		}
	} else {
		ucStartTime = ucStartTime_recover;
	}
	$("#mod-clock").addClass("mod-clock_active");
	var currentTime = +new Date();
	ucCounter = parseInt((currentTime - ucStartTime) / 1000);
	setClock(ucCounter);
	ucInteval = setInterval(function () {
		setClock(++ucCounter)
	}, 1000);
	$("#mod-clock__status").text(lang("stopHint"));
	setTitle(lang("statusIng"));
	ucCountStatus = 1;
	localStorage.ucCountStatus = 1;
}
function ucCountStop() {
	$("#mod-clock").attr("class", "mod-clock");
	ucStopTime = +new Date();
	createLocalUc(ucStartTime, ucStopTime);
	ucCountStatus = 0;
	localStorage.ucCountStatus = 0;
	$(".mod-clock__sec").removeClass("mod-clock__sec_current");
	$(".mod-clock__status").text(lang("startHint"));
	setTitle(lang("title") + " v" + localStorage.ucVersion);
	clearInterval(ucInteval);
}
function ucCount() {
	if (!ucCountStatus) {
		ucCountStart();
	} else {
		ucCountStop();
	}
}
function setClock(sec) {
	var min = parseInt(sec / 60);
	if(min>5){
		ucCountStop();
		setMsg(lang("moreThan5min"));
	}
	var sec = sec % 60;
	$(".mod-clock__sec").eq(sec).addClass("mod-clock__sec_current");
	if(isGingerbread){
		$(".mod-clock__sec").eq(sec - 1).removeClass("mod-clock__sec_current");
	}else{
		$(".mod-clock__sec").eq(sec - 3).removeClass("mod-clock__sec_current");
	}
	if (min) {
		$("#mod-clock__digit").html('<span class="mod-clock__num">' + min + '</span><span class="ui-color_white-alpha-alpha ui-font-size_medium">m</span> ' + '<span class="mod-clock__num">' + sec + '</span><span class="ui-color_white-alpha-alpha ui-font-size_medium">s</span>')
	} else {
		$("#mod-clock__digit").html('<span class="mod-clock__num">' + sec + '</span><span class="ui-color_white-alpha-alpha ui-font-size_medium">s</span>')
	}
}

var isClockClicked, locClockY;

if (isTouchDevice) {
	$("#mod-clock").bind("touchstart",function (e) {
		if (!event.touches.length) return;
		var touch = event.touches[0];
		locClockY = touch.clientY;
		isClockClicked = true
//		console.log("locClockY", locClockY);
	}).bind("touchmove",function (e) {
		if (!event.touches.length) return;
		var touch = event.touches[0];
		isClockClicked = Math.abs(touch.clientY - locClockY) < 5;
	}).bind("touchend", function () {
			if (isClockClicked) {
				ucCount()
			}
		}
	);
} else {
	$("#mod-clock").bind("click", function () {
		ucCount();
	})
}

$(".mod-tab__item").click(function () {
	$(".mod-tab__item").removeClass("mod-tab__item_current");
	$(this).addClass("mod-tab__item_current");
});
function getAverage(gap) {
	console.log("getAverage()");
	var data = getData();
	var current = new Date();
	var range = current - gap * 60 * 1000;
	var averageData = [];
	for (var i = 0; i < data.length; i++) {
		if (data[i].stopTime > range) {
			if (data[i].timeGap > 30 * 60) {
				continue; //一般宫缩十几分钟一次 超过半小时的就略过了
			}
			averageData.push(data[i]);
		}
	}
	return averageData;
}
function updateChart() {
	console.log("updateChart()");
	var gap = 30;
	var timeTo = new Date();
	var timeFrom = timeTo - gap * 60 * 1000;
	var arrTimeLength = [];
	var arrAverageData = getAverage(gap);
	if (arrAverageData.length == 0) {
		$("#mod-average").hide();
		return;
	} else {
		$("#mod-average").show();
	}
	var averageTimeLength = 0, averageTimeGap = 0;
	for (var j = 0; j < arrAverageData.length; j++) {
		arrTimeLength.push(arrAverageData[j].timeLength);
		averageTimeLength += arrAverageData[j].timeLength;
		averageTimeGap += arrAverageData[j].timeGap;
	}
	averageTimeLength = averageTimeLength / arrAverageData.length;
	averageTimeGap = averageTimeGap / arrAverageData.length;


	var strAverageTimeLength = formatSec(averageTimeLength);
	var strAverageTimeGap = formatSec(averageTimeGap);

	$(".mod-average__times").html(arrAverageData.length);
	$(".mod-average__timeLength").html(strAverageTimeLength);
	$(".mod-average__timeGap").html(strAverageTimeGap);
	//chart
	var maxTimeLength = Math.max.apply(null, arrTimeLength);
	var leftPercents = 0, cssLeftPercents = 0;
	$("#mod-chart__panel").empty();
	arrAverageData.reverse();
	for (var i = 0; i < arrAverageData.length; i++) {
		var heightPercents = parseInt(arrAverageData[i].timeLength / maxTimeLength * 100);
		leftPercents = leftPercents + parseInt(arrAverageData[i].timeGap);
		if (averageTimeGap) {
			cssLeftPercents = parseInt(leftPercents / (averageTimeGap * arrAverageData.length) * 100);
		}
		var modChartItem = $('<div><div class="mod-chart__gap ui-font-size_x-small">' + parseInt(arrAverageData[i].timeGap / 60) + '</div></div>');
		modChartItem.attr({
			"class": "mod-chart__item",//SyntaxError: Parse error android 2.3
			style  : "height:" + heightPercents + "%;left:" + cssLeftPercents + "%"
		});
		if (arrAverageData[i].timeGap / 60 < 6 && arrAverageData[i].timeGap != 0) {
			modChartItem.addClass("mod-chart__item_alarm");
		} else if (arrAverageData[i].timeGap / 60 < 11 && arrAverageData[i].timeGap != 0) {
			modChartItem.addClass("mod-chart__item_warning");
		}

		$("#mod-chart__panel").append(modChartItem);
	}
	//from time to time
	$("#mod-chart__range_from").text(new Date(timeFrom).getHours() + ":" + addZero(new Date(timeFrom).getMinutes()));
	$("#mod-chart__range_to").text(timeTo.getHours() + ":" + addZero(timeTo.getMinutes()));
	//global status
	if (averageTimeGap == 0) {
		localStorage.ucStatus = "default"
	} else if (parseInt(averageTimeGap / 60) < 6) {
		localStorage.ucStatus = "alarm";
	} else if (parseInt(averageTimeGap / 60) < 11) {
		localStorage.ucStatus = "warning"
	}
}
function upDate() {
	console.log("upDate()");
	updateChart();
	updatePageTable(6);
}

function setMsg(msg) {
	$("#mod-msg").text(msg).show();
	setTimeout(function () {
		$("#mod-msg").hide()
	}, 5000);
}

/* mod menu*/
var menuStatus = false;
function toggleMenu() {
	console.log("toggleMenu()");
	if (!menuStatus) {
		$("body").addClass("hasMenu");
		menuStatus = true;
	} else {
		$("body").removeClass("hasMenu");
		menuStatus = false;
	}
}
$("#mod-top-bar__left").click(function () {
	toggleMenu();
});
$("#mod-mask").click(function () {
	toggleMenu();
});

function getReadMe() {
	toggleMenu();
	$(".mod-readme").show().css("opacity", "1");
}
function hideReadMe() {
	$('.mod-readme').hide();
}
document.addEventListener("menubutton", toggleMenu, false);
initLayout();