
package com.mynote.app.api.service.upload;

import java.awt.image.BufferedImage;
import java.io.File;
import java.io.IOException;
import java.util.ArrayList;
import java.util.List;

import javax.imageio.ImageIO;

import org.apache.pdfbox.pdmodel.PDDocument;
import org.apache.pdfbox.rendering.PDFRenderer;
import org.springframework.stereotype.Service;

/**
 * PDF → PNG 変換サービス（PDFBox）
 * 300dpi など希望DPIでレンダリングする。
 */
@Service
public class PdfToImageService {

    public List<File> convert(File pdfFile, int dpi) throws IOException {
        List<File> imageFiles = new ArrayList<>();
        try (PDDocument document = PDDocument.load(pdfFile)) {
            PDFRenderer renderer = new PDFRenderer(document);
            for (int i = 0; i < document.getNumberOfPages(); i++) {
                BufferedImage image = renderer.renderImageWithDPI(i, dpi);
                File out = File.createTempFile("page-" + (i + 1) + "-", ".png");
                ImageIO.write(image, "png", out);
                imageFiles.add(out);
            }
        }
        return imageFiles;
    }
}
