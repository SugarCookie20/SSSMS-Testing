package com.sssms.portal.features.notices.dto;

import com.sssms.portal.features.notices.TargetRole;
import lombok.Data;

@Data
public class NoticeRequest {
    private String title;
    private String content;
    private TargetRole targetRole;
}