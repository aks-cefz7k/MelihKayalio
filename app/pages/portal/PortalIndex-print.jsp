﻿<%@ page language="java" contentType="text/html; charset=utf-8"
    pageEncoding="utf-8"%>
<%@ taglib prefix="s" uri="/struts-tags"%>
<%@ taglib prefix="bi" uri="/WEB-INF/common.tld"%>
<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
<html xmlns="http://www.w3.org/1999/xhtml">
<head>
	 <meta http-equiv="Content-Type" content="text/html; charset=utf-8" />
   <title>报表打印</title>

    <script type="text/javascript" src="../ext-res/js/jquery.min.js"></script>
	<script language="javascript" src="../ext-res/js/ext-base.js"></script>
	<link rel="stylesheet" type="text/css" href="../ext-res/css/fonts-min.css" />
	<link rel="stylesheet" type="text/css" href="../ext-res/css/boncbase.css" />
    <link rel="stylesheet" type="text/css" href="../resource/css/portal.css?v2" />
	<script type="text/javascript" src="../ext-res/My97DatePicker/WdatePicker.js"></script>
	<link rel="stylesheet" type="text/css" href="../resource/jquery-easyui-1.3.4/themes/default/easyui.css">
	<link rel="stylesheet" type="text/css" href="../resource/jquery-easyui-1.3.4/themes/icon.css">
	<script type="text/javascript" src="../resource/jquery-easyui-1.3.4/jquery.easyui.min.js"></script>
	<script type="text/javascript" src="../ext-res/js/echarts.min.js"></script>
	<script language="javascript" src="../ext-res/js/sortabletable.js"></script>
    

   
</head>
<style>

</style>

<script language="javascript">
jQuery(function(){
	window.setTimeout(function(){
		print();
	}, 2000);
});
</script>

 <body>
<div style="width:960px; margin:0 auto;">
${str}
</div>
</body>
</html>