﻿<%@ page language="java" contentType="text/html; charset=utf-8"
    pageEncoding="utf-8"%>
<%@ taglib prefix="s" uri="/struts-tags"%>
<%@ taglib prefix="bi" uri="/WEB-INF/common.tld"%>
<!DOCTYPE html>
<html lang="en">
<head>
<meta http-equiv="Content-Type" content="text/html; charset=utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0">
<title>报表查看</title>
<link rel="shortcut icon" type="image/x-icon" href="../resource/img/rs_favicon.ico">
<link href="../ext-res/css/bootstrap.min.css" rel="stylesheet">
<link href="../resource/css/animate.css" rel="stylesheet">
<link href="../resource/css/style.css" rel="stylesheet">
<link href="../resource/css/font-awesome.css?v=4.4.0" rel="stylesheet">
<script type="text/javascript" src="../ext-res/js/jquery.min.js"></script>
<script type="text/javascript" src="../ext-res/js/bootstrap.min.js?v=3.3.6"></script>
<script type="text/javascript" src="../ext-res/js/ext-base.js"></script>
<script type="text/javascript" src="../ext-res/js/echarts.min.js"></script>
<script type="text/javascript" src="../ext-res/js/sortabletable.js"></script>
<link rel="stylesheet" type="text/css" href="../resource/jquery-easyui-1.4.4/themes/gray/easyui.css">
<link rel="stylesheet" type="text/css" href="../resource/jquery-easyui-1.4.4/themes/icon.css">
<script type="text/javascript" src="../resource/jquery-easyui-1.4.4/jquery.easyui.min.js"></script>
<script type="text/javascript" src="../ext-res/My97DatePicker/WdatePicker.js"></script>
</head>
<script language="javascript">
$(function(){
	__showLoading();
	$("#optarea").load("PortalIndex!view.action",{pageId:'${pageId}', t:Math.random()}, function(){
		 __hideLoading();
	});
});
function printpage() {
	var url2 = "about:blank";
	var name = "printwindow";
	window.open(url2, name);
	var ctx = "<form name='prtff' method='post' target='printwindow' action=\"PortalIndex!print.action\" id='expff'><input type='hidden' name='pageId' id='pageId' value='${pageId}'></form>";
	$(ctx).appendTo("body").submit().remove();
}
function exportPage(tp){
	var expType = "html";
	var ctx = "<form name='expff' method='post' action=\"Export.action\" id='expff'><input type='hidden' name='type' id='type'><input type='hidden' name='pageId' id='pageId' value='${pageId}'><input type='hidden' name='picinfo' id='picinfo'></form>";
	if($("#expff").size() == 0 ){
		$(ctx).appendTo("body");
	}
	$("#expff #type").val(tp);
	//把图形转换成图片
	var strs = "";
	if(tp == "pdf" || tp == "excel" || tp == "word"){
		$("div.chartUStyle").each(function(index, element) {
			var id = $(this).attr("id");
			id = id.substring(1, id.length);
			var chart = echarts.getInstanceByDom(document.getElementById(id));
			var str = chart.getDataURL({type:'png', pixelRatio:1, backgroundColor: '#fff'});
			str = str.split(",")[1]; //去除base64标记
			str = $(this).attr("label") + "," + str; //加上label标记
			strs = strs  +  str;
			if(index != $("div.chartUStyle").size() - 1){
				strs = strs + "@";
			}
			
		});
	}
	$("#expff #picinfo").val(strs);
	$("#expff").submit();
}
</script>
<style>
table.r_layout {
	table-layout:fixed;
	width:100%;
}
table.r_layout td.layouttd {
	padding:10px;
}
.ibox {
	margin-bottom:20px;
}
.ibox-content {
	overflow:auto;
}
.inputform2 {
	width:120px;
}
.inputtext {
	width:90px;
}
</style>
<body class="gray-bg">
<nav class="navbar navbar-default" role="navigation" style="margin-bottom:0px;">
    <div>
        <!--向左对齐-->
        <ul class="nav navbar-nav navbar-left">
		<s:if test="#request.income != 'menu'">
		<li><a href="PortalIndex!customization.action?pageId=${pageId}">定制</a></li>
		</s:if>
		<li class="dropdown">
        	<a href="#" class="dropdown-toggle" data-toggle="dropdown">
            	导出
                <b class="caret"></b>
            </a>
            <ul class="dropdown-menu">
                <li><a href="javascript:exportPage('html');">HTML</a></li>
                <li><a href="javascript:exportPage('csv');">CSV</a></li>
                <li><a href="javascript:exportPage('excel');">EXCEL</a></li>
                <li><a href="javascript:exportPage('word');">WORD</a></li>
				<li><a href="javascript:exportPage('pdf');">PDF</a></li>
            </ul>
        </li>
		<li><a href="javascript:printpage();">打印</a></li>
		<s:if test="#request.income != 'menu'">
		<li><a href="PortalIndex.action">返回</a></li>
		</s:if>
        </ul>
    </div>
</nav>
<div class="animated fadeInDown" style="margin:10px;">
<div id="optarea"></div>
</div>

</body>
</html>