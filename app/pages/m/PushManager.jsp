<%@ page language="java" contentType="text/html; charset=utf-8"
    pageEncoding="utf-8"%>
<%@ taglib prefix="s" uri="/struts-tags"%>
<%@ taglib prefix="bi" uri="/WEB-INF/common.tld"%>
<!DOCTYPE html>
<html lang="en">
<head>
<meta http-equiv="Content-Type" content="text/html; charset=utf-8" />
<title>手机报表管理</title>
<link href="../ext-res/css/bootstrap.min.css" rel="stylesheet">
<link href="../resource/css/animate.css" rel="stylesheet">
<link href="../resource/css/style.css" rel="stylesheet">
<link href="../resource/css/font-awesome.css?v=4.4.0" rel="stylesheet">
<script type="text/javascript" src="../ext-res/js/jquery.min.js"></script>
<script type="text/javascript" src="../ext-res/js/ext-base.js"></script>
<link rel="stylesheet" type="text/css" href="../resource/jquery-easyui-1.4.4/themes/gray/easyui.css">
<link rel="stylesheet" type="text/css" href="../resource/jquery-easyui-1.4.4/themes/icon.css">
<script type="text/javascript" src="../resource/jquery-easyui-1.4.4/jquery.easyui.min.js"></script>
<script type="text/javascript" src="../resource/jquery-easyui-1.4.4/locale/easyui-lang-zh_CN.js"></script>
</head>
<script language="javascript">
jQuery(function(){
	var dt = [{id:'zty', text:'手机报表分类', iconCls:'icon-subject', children:${str}}];
	$("#typetree").tree({
		data:dt,
		onClick:function(node){
			var type = node.id;
			if(type == "zty"){
				type = "";
			}
			$('#cubelist').datagrid('load',{
				cataId: type,
				t:Math.random()
			});
		}
	});
	
	$("#cubelist").datagrid({
		singleSelect:true,
		collapsible:false,
		url:'PushManager!list.action',
		pagination:false,
		queryParams:{t:Math.random()},
		method:'get',
		toolbar:[{
			 text:'新增',
			 iconCls:'icon-add',
			 handler:function(){
				 location.href = '../portal/PortalIndex!customization.action?is3g=y&menus={print:0,export:0}';
			 }
		}],
		onDblClickRow: function(index, data){
			editr();
		},
		onRowContextMenu:function(e,index,row){
			e.preventDefault();
			e.stopPropagation();
			$("#cubelist").datagrid("selectRow", index);
			var offset = {left:e.pageX, top:e.pageY};
			$("#menus").menu("show", {left:offset.left, top:offset.top});
		}
	});
});
function editr(){
	var row = $("#cubelist").datagrid("getChecked");
	if(row == null || row.length == 0){
		$.messager.alert("出错了。","您还未勾选数据。", "error");
		return;
	}
	editReport(row[0].id);
}
function delr(){
	var row = $("#cubelist").datagrid("getChecked");
	if(row == null || row.length == 0){
		$.messager.alert("出错了。","您还未勾选数据。", "error");
		return;
	}
	var data = row[0];
	if(confirm("是否确认删除？")){
		$.ajax({
			url:"PushManager!del.action",
			type:"GET",
			data:{id:data.id},
			dataType:"HTML",
			success:function(){
				$('#cubelist').datagrid('load',{
					t:Math.random()
				});
			}
		});
	}
}
function editReport(id){
	var url = '../portal/PortalIndex!customization.action?is3g=y&pageId='+id+"&menus={back:0,print:0,export:0}";
	var tb = [{
		iconCls:'icon-back',
		text:"返回",
		handler:function(){
			
			var win = document.getElementById("reportInfo").contentWindow;
			if(win.curTmpInfo && win.curTmpInfo.isupdate == true){
				$.messager.confirm("请确认","报表未保存，是否确认关闭？", function(r){
					if(r){
						$("#pdailog").dialog("close");
					}
				});
			}else{
				$("#pdailog").dialog("close");
			}
		}
	}];
	var obj = {
		fit:true,
		border:false,
		closed: false,
		cache: false,
		modal: false,
		noheader:true,
		content:"<iframe id=\"reportInfo\" name=\"reportInfo\" src=\""+url+"\" frameborder=\"0\" width=\"100%\" height=\"100%\"></iframe>",
		toolbar:tb
	};
	$('#pdailog').dialog(obj);
}
function fmtdt(value,row,index){
	var myDate = new Date(value.time);
	return myDate.getFullYear() + "-" + (myDate.getMonth()+1) + "-" + myDate.getDate();
}
</script>
<body class="gray-bg">


<div class="wrapper wrapper-content">
 <div class="row">
				<div class="col-sm-3">
	<div class="ibox">

					<div class="ibox-title">
                        <h5>手机报表分类</h5>
                    </div>
<div class="ibox-content">

 <ul id="typetree"></ul>

 </div>

</div>
 </div>
 
   <div class="col-sm-9 animated fadeInRight">
	<div class="ibox">

			<div class="ibox-title">
				<h5>手机报表列表</h5>
			</div>
	<div class="ibox-content">

	  <table id="cubelist" title="" style="width:auto;height:auto;" >
      <thead>
      <tr>
      	<th data-options="field:'ck',checkbox:true"></th>
       <th data-options="field:'name',width:195">名称</th>
        <th data-options="field:'typename',width:100">分类</th>
       <th data-options="field:'uname',width:100">创建人</th>
       <th data-options="field:'cdate',width:100,formatter:fmtdt">创建时间</th>
       <th data-options="field:'udate',width:100,formatter:fmtdt">修改时间</th>
       </tr>
       </thead>
       </table>
   

	 </div>

	</div>
	 </div>
 </div>
</div>
   
     

<div id="menus" class="easyui-menu">
 	<div iconCls="icon-edit" onclick="editr()" >编辑</div>
    <div iconCls="icon-remove" onclick="delr()" >删除</div>
</div>
<div id="pdailog"></div>
</body>
</html>