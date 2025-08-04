// main.js
document.addEventListener('DOMContentLoaded', function () {
  document.querySelector('.button').addEventListener('click', function (event) {
    event.preventDefault();
    capturarInformacoes();
  });
});

function capturarInformacoes() {
  const complementoUrl = document.getElementById("complementoUrl").value.trim();
  const numeroPaginas = parseInt(document.getElementById("numeroPaginas").value, 10);

  if (complementoUrl && numeroPaginas && numeroPaginas > 0) {
    showOutput("Download iniciado");
    getImageUrl(complementoUrl, numeroPaginas);
  } else {
    showOutput("Por favor, preencha todos os campos corretamente!");
  }
}
