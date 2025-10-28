package com.mynote.app.api.dto.note;

import java.io.Serializable;

import lombok.Data;

/** 目次の解説（body）編集 */
@Data
public class TocExplanationEditRequestDto implements Serializable {
     private String body;
}
