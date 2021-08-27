<%@ page language="java" contentType="text/html; charset=utf-8"
    pageEncoding="utf-8"%>
<%@ taglib prefix="s" uri="/struts-tags"%>
     
<s:iterator var="e" value="#request.datas" status="statu">
<%
String id = (String)pageContext.findAttribute("id");
String ids = (String)request.getAttribute("vals");
if(id != null && id.length() > 0){  //忽略 id 为 null 的
%>	
<div class="checkbox checkbox-info"><input type="checkbox" id="d${statu.index}" name="dimval" desc="${name}" value="${id}"  <%if(com.ruisi.vdop.web.bireport.DimFilterAction.exist(id, ids.split(","))){%>checked="true"<%}%> > <label for="d${statu.index}">${name}</label></div>
<%
}
%>
</s:iterator>
