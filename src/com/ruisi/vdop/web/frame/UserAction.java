package com.ruisi.vdop.web.frame;

import java.io.IOException;
import java.util.Map;

import javax.servlet.http.HttpServletResponse;

import net.sf.json.JSONObject;

import com.ruisi.ext.engine.dao.DaoHelper;
import com.ruisi.vdop.util.VDOPUtils;

/**
 * 用户信息
 * @author hq
 * @date 2017-6-26
 */
public class UserAction {
	
	private DaoHelper daoHelper;
	
	private String userId;

	public String execute() throws IOException{
		this.userId = VDOPUtils.getLoginedUser().getUserId();
		Map uinfo = (Map)daoHelper.getSqlMapClientTemplate().queryForObject("vdop.frame.user.uinfo", this);
		HttpServletResponse resp = VDOPUtils.getResponse();
		resp.setContentType("text/xml; charset=UTF-8");
		String ctx = JSONObject.fromObject(uinfo).toString();
		resp.getWriter().println(ctx);
		return null;
	}

	public DaoHelper getDaoHelper() {
		return daoHelper;
	}

	public void setDaoHelper(DaoHelper daoHelper) {
		this.daoHelper = daoHelper;
	}

	public String getUserId() {
		return userId;
	}

	public void setUserId(String userId) {
		this.userId = userId;
	}
	
}
