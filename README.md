# Clima por Cidade

Projeto desenvolvido em JavaScript para consultar o clima atual de uma cidade utilizando dados da API Open-Meteo.

A ideia principal do projeto foi praticar consumo de APIs e JavaScript assíncrono em uma aplicação funcional, indo além de apenas realizar uma requisição e mostrar o resultado na tela.

## Funcionalidades

O usuário pode começar a digitar o nome de uma cidade e receber sugestões automaticamente.

A lista de sugestões pode ser utilizada tanto com o mouse quanto pelo teclado, usando as setas para navegar e Enter para selecionar uma cidade.

Após a seleção, a aplicação consulta os dados meteorológicos e exibe informações como:

- Temperatura atual
- Sensação térmica
- Umidade
- Condição do clima
- Cidade, estado e país
- Latitude e longitude

A aplicação também trata situações como cidades não encontradas, falhas de requisição e mudanças rápidas na pesquisa.

## O que pratiquei neste projeto

Durante o desenvolvimento trabalhei principalmente com:

- JavaScript assíncrono
- `fetch`
- Promises
- `async/await`
- `try/catch`
- Consumo e tratamento de dados de API
- `AbortController`
- Debounce na pesquisa
- Manipulação do DOM
- Eventos de teclado e mouse
- Autocomplete
- Validação de respostas HTTP
- Tratamento de erros
- Separação entre HTML, CSS e JavaScript
- Refatoração e redução de código duplicado

Um dos pontos mais interessantes foi trabalhar com cancelamento de requisições.

Quando o usuário digita rapidamente ou escolhe outra cidade antes da requisição anterior terminar, a aplicação cancela a operação anterior para evitar que uma resposta antiga sobrescreva os dados mais recentes.

## APIs utilizadas

O projeto utiliza a Open-Meteo.

A API de geocodificação é responsável por localizar as cidades e obter suas coordenadas.

Depois disso, latitude e longitude são utilizadas para consultar os dados meteorológicos atuais.

## Estrutura

O projeto foi separado em três arquivos principais:

- `index.html` — estrutura da página
- `style.css` — estilos e indicação visual do autocomplete
- `script.js` — lógica da aplicação, requisições e interação com o usuário

## Objetivo do projeto

Este projeto faz parte dos meus estudos de JavaScript.

O foco não foi criar uma interface visual elaborada, mas desenvolver a lógica da aplicação e praticar conceitos importantes utilizados em aplicações reais, principalmente comunicação com APIs, código assíncrono e controle de estado durante requisições.

A parte visual poderá receber melhorias futuramente, mantendo esta versão como registro da evolução durante os estudos.