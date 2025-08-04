// api.js
async function getImageUrl() {
  const complementoUrl = document.getElementById("complementoUrl").value;
  const numeroPaginas = parseInt(document.getElementById("numeroPaginas").value, 10);

  if (!complementoUrl || !numeroPaginas) {
    showOutput("Por favor, preencha todos os campos!");
    return;
  }

  const proxyUrl = "https://api.allorigins.win/get?url=";
  const urlFinal = "https://issuu.com/" + complementoUrl;
  const urlComProxy = proxyUrl + encodeURIComponent(urlFinal);

  console.log(`Acessando URL com proxy: ${urlComProxy}`);

  try {
    const response = await fetch(urlComProxy);
    const json = await response.json();

    if (response.ok && json.contents) {
      const pageContent = json.contents;

      // Regex para pegar publicationId e revisionId na ordem correta
      const pattern = /publicationId\\\":\\\"([a-f0-9]+)\\\".*?revisionId\\\":\\\"(\d+)\\\"/;
      const matches = pageContent.match(pattern);

      if (!(matches && matches[1] && matches[2])) {
        showOutput("Infos necessárias não encontradas.");
        return;
      }

      const publicationId = matches[1];
      const revisionId = matches[2];

      const imageUrls = [];

      for (let pagina = 1; pagina <= numeroPaginas; pagina++) {
        const imageUrl = `https://image.isu.pub/${revisionId}-${publicationId}/jpg/page_${pagina}.jpg`;
        console.log(`Construindo/esperando antes de adicionar página ${pagina}: ${imageUrl}`);
        imageUrls.push(imageUrl);
        // delay de 2 segundos entre a construção/adição das URLs (para espaçar requisições)
        await new Promise(res => setTimeout(res, 2000));
      }

      // Chama o gerador de PDF com todas as URLs
      await gerarPDF(imageUrls);
    } else {
      throw new Error("Não foi possível obter o conteúdo da página.");
    }
  } catch (error) {
    console.error("Erro ao acessar a página:", error);
    showOutput("Erro ao acessar a página: " + error.message);
  }
}
