<%@ page language="java" contentType="text/html; charset=utf-8"
    pageEncoding="utf-8"%>
<%@ taglib prefix="s" uri="/struts-tags"%>
<%@ taglib prefix="bi" uri="/WEB-INF/common.tld"%>
<!DOCTYPE html>
<html lang="en">
<head>
<meta http-equiv="Content-Type" content="text/html; charset=utf-8" />
<title>睿思云 - 数据报表</title>
<link rel="shortcut icon" type="image/x-icon" href="../resource/img/rs_favicon.ico">
<link href="../ext-res/css/bootstrap.min.css" rel="stylesheet">
<link href="../resource/css/animate.css" rel="stylesheet">
<link href="../resource/css/style.css" rel="stylesheet">
<link href="../resource/css/font-awesome.css?v=4.4.0" rel="stylesheet">
<script type="text/javascript" src="../ext-res/js/jquery.min.js"></script>
<script type="text/javascript" src="../ext-res/js/ext-base.js"></script>
<link rel="stylesheet" type="text/css" href="../resource/jquery-easyui-1.4.4/themes/gray/easyui.css">
<link rel="stylesheet" type="text/css" href="../resource/jquery-easyui-1.4.4/themes/icon.css">
<script type="text/javascript" src="../resource/jquery-easyui-1.4.4/jquery.easyui.min.js"></script>
</head>
<script language="javascript">
$(function(){
	$(".file-box").mouseover(function(){
		$(this).find(".tooltip").css("display", "block");
	}).mouseout(function(){
		$(this).find(".tooltip").css("display", "none");
	});
});
function renamereport(id){
	$.messager.prompt('报表改名', '请输入新的报表名称？', function(msg){
		if(msg){
			$.ajax({
				  type: "POST",
				   url: "PortalIndex!rename.action",
				   dataType:"HTML",
				   data: {pageId:id, pageName:msg},
				   success: function(resp){
					   $("div.file-box[cid=\""+id+"\"] .file-name a").text(msg);
				   },
				   error:function(){
					  
				   }
			});
		}
	});
}
function delreport(id){
	if(confirm('是否确认删除？')){
		$.ajax({
			  type: "POST",
			   url: "PortalIndex!del.action",
			   dataType:"HTML",
			   data: {pageId:id},
			   success: function(resp){
				  $("div.file-box[cid=\""+id+"\"]").remove();
			   },
			   error:function(){
				  
			   }
		});
	}
}
function newreport(){
	location.href = 'PortalIndex!customization.action';
}
function editreport(id){
	location.href = 'PortalIndex!customization.action?pageId=' + id;
}
</script>
<body class="gray-bg">
<div class="wrapper wrapper-content">
 <div class="row">
 <div class="col-sm-3">
	<div class="ibox float-e-margins">
		<div class="ibox-content">
		<button onclick="location.href='PortalIndex!customization.action'" class="btn btn-sm btn-primary">新建报表</button>
<p class="text-warning">定制个性化的数据可视化界面</p>
		</div>
	</div>
 </div>
<div class="col-sm-9  animated fadeInRight">
 <s:iterator var="e" value="#request.ls" status="statu">

	<div class="file-box" cid="${e.id}">
		<div class="file">
			<span class="corner"></span>
			<div class="tooltip" align="right" style="position:absolute; display:none; margin:3px;" >
				<button class="btn btn-default btn-xs" type="button" onclick="renamereport('${e.id}')" title="改名"><i class="fa fa-paste"></i></button>
				<button class="btn btn-default btn-xs" type="button" onclick="editreport('${e.id}')" title="定制"><i class="fa fa-edit"></i></button>
				<button class="btn btn-default btn-xs" type="button" onclick="delreport('${e.id}')" title="删除"><i class="fa fa-remove"></i></button>
			</div>
			<a href="PortalIndex!show.action?pageId=${e.id}">
			<div class="icon">
				<i class="fa fa-bar-chart"></i>
			</div>
			</a>
			
			<div class="file-name" align="center">
				<a href="PortalIndex!show.action?pageId=${e.id}">${e.name} </a>
			</div>
		</div>
	</div>

 </s:iterator>
 
 </div>
 </div>
</div>

</body>
</html>