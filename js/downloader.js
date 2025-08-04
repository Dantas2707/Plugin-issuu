// downloader.js
function downloadImage(url, filename) {
  console.log(`Baixando imagem: ${url}`);

  fetch(url)
    .then(response => {
      if (!response.ok) {
        throw new Error("Não foi possível acessar a imagem");
      }
      return response.blob();
    })
    .then(blob => {
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.download = filename;
      link.click();
    })
    .catch(error => {
      console.error("Erro ao baixar imagem:", error);
      showOutput("Erro ao baixar imagem: " + error.message);
    });
}
