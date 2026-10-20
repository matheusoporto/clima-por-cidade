const cidade = document.querySelector("#cidade");
const carregamento = document.querySelector("#carregamento");
const resultado = document.querySelector("#resultado");
const sugestoes = document.querySelector("#sugestoes");
const conteinerSugestoes = document.querySelector(".conteinerSugestoes");

let requisicaoClimaAtual = null;
let timerDeBusca = null;
let requisicaoSugestoes = null;
let indiceSugestaoSelecionada = -1;


function destaqueSugestao() {
    const opcoes = sugestoes.querySelectorAll("li:not(.mensagemSugestao)");

    opcoes.forEach((opcao) => {
        opcao.classList.remove("selecionada");
    });

    if (
        indiceSugestaoSelecionada >= 0 &&
        indiceSugestaoSelecionada < opcoes.length
    ) {
        opcoes[indiceSugestaoSelecionada].classList.add("selecionada");
    }
}


function traduzirCodigoClima(codigoClima) {
    switch (codigoClima) {
        case 0:
            return "Céu limpo";

        case 1:
            return "Predominantemente limpo";

        case 2:
            return "Parcialmente nublado";

        case 3:
            return "Encoberto";

        case 45:
            return "Nevoeiro";

        case 48:
            return "Nevoeiro com formação de geada";

        case 51:
            return "Chuvisco leve";

        case 53:
            return "Chuvisco moderado";

        case 55:
            return "Chuvisco intenso";

        case 56:
            return "Chuvisco congelante leve";

        case 57:
            return "Chuvisco congelante intenso";

        case 61:
            return "Chuva fraca";

        case 63:
            return "Chuva moderada";

        case 65:
            return "Chuva forte";

        case 66:
            return "Chuva congelante leve";

        case 67:
            return "Chuva congelante forte";

        case 71:
            return "Neve fraca";

        case 73:
            return "Neve moderada";

        case 75:
            return "Neve forte";

        case 77:
            return "Grãos de neve";

        case 80:
            return "Pancadas de chuva fracas";

        case 81:
            return "Pancadas de chuva moderadas";

        case 82:
            return "Pancadas de chuva fortes";

        case 85:
            return "Pancadas de neve fracas";

        case 86:
            return "Pancadas de neve fortes";

        case 95:
            return "Trovoada";

        case 96:
            return "Trovoada com granizo leve";

        case 97:
            return "Trovoada forte";

        case 99:
            return "Trovoada com granizo forte";

        default:
            return "Código não mapeado";
    }
}


function exibirMensagemSugestao(mensagem) {
    const itemMensagemSugestao = document.createElement("li");

    itemMensagemSugestao.textContent = mensagem;
    itemMensagemSugestao.classList.add("mensagemSugestao");

    sugestoes.appendChild(itemMensagemSugestao);
}


async function buscarSugestoes(termoPesquisa) {
    if (requisicaoSugestoes) {
        requisicaoSugestoes.abort();
    }

    const controllerSugestoes = new AbortController();

    requisicaoSugestoes = controllerSugestoes;

    const termoBuscaCodificado = encodeURIComponent(termoPesquisa);

    try {
        const respostaSugestoes = await fetch(
            `https://geocoding-api.open-meteo.com/v1/search?name=${termoBuscaCodificado}&count=5&language=pt`,
            {
                signal: controllerSugestoes.signal,
            }
        );

        if (respostaSugestoes.ok) {
            const dadosSugestoes = await respostaSugestoes.json();
            const listaCidades = dadosSugestoes.results;

            fecharSugestoes();

            if (!listaCidades || !listaCidades.length) {
                exibirMensagemSugestao("Nenhuma cidade encontrada");
                return;
            }

            listaCidades.forEach((cidade) => {
                if (
                    !cidade.name ||
                    cidade.longitude === undefined ||
                    cidade.longitude === null ||
                    cidade.latitude === undefined ||
                    cidade.latitude === null
                ) {
                    return;
                }

                let regiao;

                if (cidade.admin1) {
                    regiao = cidade.admin1;
                } else {
                    regiao = "Região não informada";
                }

                let pais;

                if (cidade.country) {
                    pais = cidade.country;
                } else {
                    pais = "País não informado";
                }

                const liCidade = document.createElement("li");

                liCidade.textContent = `${cidade.name} - ${regiao} - ${pais} `;

                liCidade.dataset.latitude = cidade.latitude;
                liCidade.dataset.longitude = cidade.longitude;
                liCidade.dataset.name = cidade.name;
                liCidade.dataset.admin1 = regiao;
                liCidade.dataset.country = pais;

                sugestoes.appendChild(liCidade);
            });
        } else {
            throw new Error(
                `Resposta de busca de cidades não está ok - status:${respostaSugestoes.status}`
            );
        }
    } catch (erro) {
        if (erro.name === "AbortError") {
            return;
        } else {
            fecharSugestoes();
            exibirMensagemSugestao("Erro ao buscar cidades");
            console.error(erro);
        }
    } finally {
        if (requisicaoSugestoes === controllerSugestoes) {
            requisicaoSugestoes = null;
        }
    }
}


async function buscarClimaDaCidade(cidadeSelecionada) {
    if (requisicaoClimaAtual) {
        requisicaoClimaAtual.abort();
    }

    const controllerClima = new AbortController();

    requisicaoClimaAtual = controllerClima;

    try {
        resultado.textContent = "";
        carregamento.textContent = "Carregando";

        const respostaClima = await fetch(
            `https://api.open-meteo.com/v1/forecast?latitude=${cidadeSelecionada.latitude}&longitude=${cidadeSelecionada.longitude}&current=temperature_2m,relative_humidity_2m,apparent_temperature,weather_code`,
            {
                signal: controllerClima.signal,
            }
        );

        if (respostaClima.ok) {
            const dadosClima = await respostaClima.json();

            if (!dadosClima.current) {
                throw new Error("Dados de clima não disponíveis!");
            }

            const climaAtual = dadosClima.current;

            if (
                climaAtual.temperature_2m === null ||
                climaAtual.temperature_2m === undefined ||
                climaAtual.apparent_temperature === null ||
                climaAtual.apparent_temperature === undefined ||
                climaAtual.relative_humidity_2m === null ||
                climaAtual.relative_humidity_2m === undefined ||
                climaAtual.weather_code === null ||
                climaAtual.weather_code === undefined
            ) {
                throw new Error("Dados não disponíveis!");
            }

            const temperatura = climaAtual.temperature_2m;
            const sensacaoTermica = climaAtual.apparent_temperature;
            const umidade = climaAtual.relative_humidity_2m;
            const codigoClima = climaAtual.weather_code;
            const codigoClimaTraduzido = traduzirCodigoClima(codigoClima);

            resultado.innerHTML = `Nome: ${cidadeSelecionada.name},
                <br> Estado: ${cidadeSelecionada.admin1},
                <br> País: ${cidadeSelecionada.country},
                <br> Latitude: ${cidadeSelecionada.latitude},
                <br> Longitude: ${cidadeSelecionada.longitude},
                <br> Temperatura: ${temperatura}°C,
                <br> Sensação Térmica: ${sensacaoTermica}°C,
                <br> Umidade: ${umidade}%,
                <br> Clima: ${codigoClimaTraduzido}`;
        } else {
            throw new Error(
                `Clima Local não disponível - status:${respostaClima.status}`
            );
        }
    } catch (erro) {
        if (erro.name === "AbortError") {
            return;
        } else {
            resultado.textContent = erro.message;
            console.error(erro);
        }
    } finally {
        if (requisicaoClimaAtual === controllerClima) {
            requisicaoClimaAtual = null;
            carregamento.textContent = "";
        }
    }
}


function selecionarSugestao(opcao) {
    const nameSelecionado = opcao.dataset.name;
    const admin1Selecionado = opcao.dataset.admin1;
    const countrySelecionado = opcao.dataset.country;
    const latitudeSelecionada = opcao.dataset.latitude;
    const longitudeSelecionada = opcao.dataset.longitude;

    const cidadeSelecionada = {
        name: nameSelecionado,
        admin1: admin1Selecionado,
        country: countrySelecionado,
        latitude: latitudeSelecionada,
        longitude: longitudeSelecionada,
    };

    cidade.value = opcao.textContent;

    fecharSugestoes();

    buscarClimaDaCidade(cidadeSelecionada);
}


sugestoes.addEventListener("click", function (event) {
    const opcaoClicada = event.target;

    if (
        opcaoClicada.tagName === "LI" &&
        !opcaoClicada.classList.contains("mensagemSugestao")
    ) {
        selecionarSugestao(opcaoClicada);
    }
});


cidade.addEventListener("input", function () {
    fecharSugestoes();

    const termoPesquisa = cidade.value.trim();

    if (timerDeBusca) {
        clearTimeout(timerDeBusca);
        timerDeBusca = null;
    }

    if (requisicaoSugestoes) {
        requisicaoSugestoes.abort();
    }

    if (termoPesquisa.length < 3) {
        return;
    }

    timerDeBusca = setTimeout(function () {
        timerDeBusca = null;

        buscarSugestoes(termoPesquisa);
    }, 500);
});


cidade.addEventListener("keydown", function (event) {
    const opcoes = sugestoes.querySelectorAll(
        "li:not(.mensagemSugestao)"
    );

    if (event.key === "ArrowDown") {
        event.preventDefault();
        if (indiceSugestaoSelecionada < opcoes.length - 1) {            
            indiceSugestaoSelecionada++;
        }

        destaqueSugestao();
    }

    if (event.key === "ArrowUp") {
        event.preventDefault();
        if (indiceSugestaoSelecionada > -1) {           
            indiceSugestaoSelecionada--;
        }

        destaqueSugestao();
    }

    if (event.key === "Enter") {
        if (
            indiceSugestaoSelecionada >= 0 &&
            indiceSugestaoSelecionada < opcoes.length
        ) {
            event.preventDefault();
            const opcaoSelecionada =
                opcoes[indiceSugestaoSelecionada];
            selecionarSugestao(opcaoSelecionada);
        }
    }

    if (event.key === "Escape") {
        fecharSugestoes();
    }
});


function fecharSugestoes() {
    sugestoes.textContent = "";
    indiceSugestaoSelecionada = -1;
}


document.addEventListener("click", function (event) {
    const elementoClicado = event.target;

    if (!conteinerSugestoes.contains(elementoClicado)) {
        fecharSugestoes();
    }
});