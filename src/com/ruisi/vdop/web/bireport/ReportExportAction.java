package com.ruisi.vdop.web.bireport;

import java.io.InputStream;

import javax.servlet.http.HttpServletResponse;

import net.sf.json.JSONObject;

import org.apache.commons.io.IOUtils;

import com.ruisi.bi.engine.view.emitter.ContextEmitter;
import com.ruisi.bi.engine.view.emitter.excel.ExcelEmitter;
import com.ruisi.ext.engine.view.context.ExtContext;
import com.ruisi.ext.engine.view.context.MVContext;
import com.ruisi.ext.engine.view.emitter.pdf.PdfEmitter;
import com.ruisi.ext.engine.view.emitter.text.TextEmitter;
import com.ruisi.ext.engine.view.emitter.word.WordEmitter;
import com.ruisi.vdop.ser.bireport.ReportService;
import com.ruisi.vdop.ser.olap.CompPreviewService;
import com.ruisi.vdop.util.VDOPUtils;

public class ReportExportAction {
	
	private String type; //导出方式 
	private String json; //报表JSON
	private String picinfo;
	
	public String execute() throws Exception{
		
		ExtContext.getInstance().removeMV(ReportService.deftMvId);
		JSONObject rjson = JSONObject.fromObject(json);
		ReportService tser = new ReportService();
		MVContext mv = tser.json2MV(rjson);
		
		CompPreviewService ser = new CompPreviewService();
		ser.setParams(null);
		ser.initPreview();
		
		String fileName = "file.";
		if("html".equals(this.type)){
			fileName += "html";
		}else
		if("excel".equals(this.type)){
			fileName += "xls";
		}else
		if("csv".equals(this.type)){
			fileName += "csv";
		}else
		if("pdf".equals(this.type)){
			fileName += "pdf";
		}else 
		if("word".equals(this.type)){
			fileName += "docx";
		}
		
		HttpServletResponse resp = VDOPUtils.getResponse();
		resp.setContentType("application/x-msdownload");
		String contentDisposition = "attachment; filename=\""+fileName+"\"";
		resp.setHeader("Content-Disposition", contentDisposition);
		
		if("html".equals(this.type)){
			String ret = ser.buildMV(mv);
			String html = ReportService.htmlPage(ret, VDOPUtils.getConstant("resPath"), "olap");
			InputStream is = IOUtils.toInputStream(html, "utf-8");
			IOUtils.copy(is, resp.getOutputStream());
			is.close();
		}else
		if("excel".equals(this.type)){
			ContextEmitter emitter = new ExcelEmitter();
			ser.buildMV(mv, emitter);
		}else
		if("csv".equals(this.type)){
			ContextEmitter emitter = new TextEmitter();
			String ret = ser.buildMV(mv, emitter);
			InputStream is = IOUtils.toInputStream(ret, "gb2312");
			IOUtils.copy(is, resp.getOutputStream());
			is.close();
		}else 
		if("pdf".equals(this.type)){
			ContextEmitter emitter = new PdfEmitter();
			ser.buildMV(mv, emitter);
		}else
		if("word".equals(type)){
			ContextEmitter emitter = new WordEmitter();
			ser.buildMV(mv, emitter);
		}
		
		return null;
	}
	
	public String getType() {
		return type;
	}

	public void setType(String type) {
		this.type = type;
	}

	public String getJson() {
		return json;
	}

	public void setJson(String json) {
		this.json = json;
	}

	public String getPicinfo() {
		return picinfo;
	}

	public void setPicinfo(String picinfo) {
		this.picinfo = picinfo;
	}
	
	
}
