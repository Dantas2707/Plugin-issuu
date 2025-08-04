// pdfGenerator.js
function delay(ms) {
  return new Promise(res => setTimeout(res, ms));
}

async function convertWebpToPng(arrayBuffer) {
  return new Promise((resolve, reject) => {
    const blob = new Blob([arrayBuffer], { type: "image/webp" });
    const url = URL.createObjectURL(blob);
    const img = new Image();
    img.crossOrigin = "anonymous"; // necessário para evitar canvas tainting, depende do servidor
    img.onload = () => {
      try {
        const canvas = document.createElement("canvas");
        canvas.width = img.naturalWidth;
        canvas.height = img.naturalHeight;
        const ctx = canvas.getContext("2d");
        ctx.drawImage(img, 0, 0);
        canvas.toBlob((convertedBlob) => {
          if (convertedBlob) {
            convertedBlob.arrayBuffer().then(resolve).catch(reject);
          } else {
            reject(new Error("Falha na conversão do canvas"));
          }
          URL.revokeObjectURL(url);
        }, "image/png");
      } catch (e) {
        reject(e);
      }
    };
    img.onerror = (e) => {
      reject(new Error("Erro carregando WebP para conversão"));
    };
    img.src = url;
  });
}

async function gerarPDF(imageUrls, nomeArquivo = "documento.pdf") {
  try {
    const { PDFDocument } = PDFLib;
    const pdfDoc = await PDFDocument.create();

    for (let i = 0; i < imageUrls.length; i++) {
      const url = imageUrls[i];
      try {
        console.log(`Buscando imagem para inserir no PDF: ${url}`);
        const response = await fetch(url);
        if (!response.ok) {
          console.warn(`Imagem ${url} falhou com status ${response.status}, pulando.`);
          continue;
        }

        const contentType = (response.headers.get("content-type") || "").toLowerCase();
        if (!contentType.startsWith("image/")) {
          console.warn(`Conteúdo de ${url} não é imagem (content-type: ${contentType}), pulando.`);
          continue;
        }

        let imageBuffer;

        if (contentType.includes("webp")) {
          try {
            imageBuffer = await convertWebpToPng(await response.arrayBuffer());
          } catch (e) {
            console.warn(`Falha ao converter WebP para PNG em ${url}:`, e);
            continue;
          }
        } else {
          imageBuffer = await response.arrayBuffer();
        }

        let embeddedImage;
        if (contentType.includes("jpeg") || contentType.includes("jpg")) {
          try {
            embeddedImage = await pdfDoc.embedJpg(imageBuffer);
          } catch (jpgErr) {
            console.warn(`Falha ao embutir JPEG ${url}:`, jpgErr);
            continue;
          }
        } else if (contentType.includes("png") || contentType.includes("webp")) {
          // se era webp já convertido para PNG, usa embedPng
          try {
            embeddedImage = await pdfDoc.embedPng(imageBuffer);
          } catch (pngErr) {
            console.warn(`Falha ao embutir PNG ${url}:`, pngErr);
            continue;
          }
        } else {
          console.warn(`Tipo de imagem não suportado (${contentType}) em ${url}, pulando.`);
          continue;
        }

        const page = pdfDoc.addPage([embeddedImage.width, embeddedImage.height]);
        page.drawImage(embeddedImage, {
          x: 0,
          y: 0,
          width: embeddedImage.width,
          height: embeddedImage.height,
        });

        // Delay de 2 segundos entre adição de páginas
        await delay(2000);
      } catch (e) {
        console.error(`Erro ao processar imagem ${url}:`, e);
      }
    }

    // Delay antes de salvar
    await delay(2000);

    const pdfBytes = await pdfDoc.save();
    const blobPdf = new Blob([pdfBytes], { type: "application/pdf" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blobPdf);
    link.download = nomeArquivo;
    link.click();
  } catch (err) {
    console.error("Erro ao gerar PDF:", err);
    showOutput("Erro ao gerar PDF: " + err.message);
  }
}
