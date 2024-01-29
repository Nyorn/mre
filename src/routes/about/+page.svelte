<script>
  import { onMount } from 'svelte';
  import { faCheckCircle } from '@fortawesome/free-solid-svg-icons';

  let FontAwesomeIcon;

  onMount(async () => {
    const module = await import('svelte-awesome');
    FontAwesomeIcon = module.default;
  });
</script>

<svelte:head>


  <title>Полное Юридическое Сопровождение При Покупке Недвижимости | Sea Real Estate</title>
  <meta name="description" content="Sea Real Estate обеспечивает полное юридическое сопровождение сделок с недвижимостью в Болгарии. Продажа, покупка, поддержка с документами. Консультация с экспертами" />



</svelte:head>
{#if FontAwesomeIcon}






  <link href="https://fonts.googleapis.com/css2?family=DM+Mono:ital,wght@0,300;1,500&display=swap" rel="stylesheet">
  <div class="container main mx-auto p-6 bg-white shadow-md rounded ">

    <div class="arrow arrow--top">
      <svg xmlns="http://www.w3.org/2000/svg" width="270.11" height="649.9" overflow="visible">

        <g class="item-to bounce-1">
          <path class="geo-arrow draw-in" d="M135.06 142.564L267.995 275.5 135.06 408.434 2.125 275.499z" />
        </g>
        <circle class="geo-arrow item-to bounce-2" cx="194.65" cy="69.54" r="7.96" />
        <circle class="geo-arrow draw-in" cx="194.65" cy="39.5" r="7.96" />
        <circle class="geo-arrow item-to bounce-3" cx="194.65" cy="9.46" r="7.96" />
        <g class="geo-arrow item-to bounce-2">
          <path class="st0 draw-in" d="M181.21 619.5l13.27 27 13.27-27zM194.48 644.5v-552" />
        </g>
      </svg>
    </div>
    <div class="arrow arrow--bottom">
      <svg xmlns="http://www.w3.org/2000/svg" width="31.35" height="649.9" overflow="visible">

        <g class="item-to bounce-1">
          <circle class="geo-arrow item-to bounce-3" cx="15.5" cy="580.36" r="7.96" />
          <circle class="geo-arrow draw-in" cx="15.5" cy="610.4" r="7.96" />
          <circle class="geo-arrow item-to bounce-2" cx="15.5" cy="640.44" r="7.96" />
          <g class="item-to bounce-2">
            <path class="geo-arrow draw-in" d="M28.94 30.4l-13.26-27-13.27 27zM15.68 5.4v552" />
          </g>
        </g>
      </svg>


    </div>
    <div class="rounded ">
      <div class="main__text-wrapper ">
        <div class="content">
          <h1 class="text-3xl font-bold mb-2 main__title">Кто мы?</h1>
          <hr class="!border-t-8 !border-double pb-4 pt-4 mt-5" />
          <p class="mb-4">Мы - команда экспертов с личным опытом, специализирующихся на недвижимости в Болгарии. Наша миссия - помочь вам обрести дом, или сделать инвестицию в этом прекрасном уголке мира.</p>
          <svg xmlns="http://www.w3.org/2000/svg" class="dotted-circle" width="352" height="352" overflow="visible">
            <circle cx="176" cy="176" r="174" fill="none" stroke="#fff" stroke-width="2" stroke-miterlimit="10" stroke-dasharray="12.921,11.9271"/>
          </svg>

          <div class="mb-4">
            <h3 class="text-2xl font-semibold mb-2">🌟 Наши Преимущества:</h3>
            <ul class="list-disc pl-5">
              <li class="mb-1"><FontAwesomeIcon icon={faCheckCircle} class="text-green-500 mr-2" />Опыт и Экспертность: Мы обладаем глубоким пониманием болгарского рынка недвижимости.</li>
              <li class="mb-1"><FontAwesomeIcon icon={faCheckCircle} class="text-green-500 mr-2" />Индивидуальный Подход: Покупка недвижимости у нас - это анализ ваших потребностей.</li>
              <li class="mb-1"><FontAwesomeIcon icon={faCheckCircle} class="text-green-500 mr-2" />Эксклюзивные Предложения: Широкий выбор недвижимости и уникальные предложения.</li>
              <li class="mb-1"><FontAwesomeIcon icon={faCheckCircle} class="text-green-500 mr-2" />Инвестиционный опыт: Стратегии для устойчивого роста вашего капитала.</li>
            </ul>
          </div>

          <div>
            <h3 class="text-xl font-semibold mb-2">🌍 Почему Болгария?</h3>
            <p>Болгария - это не просто страна с красивыми пейзажами, но и место, где можно найти свой уголок под солнцем. Откройте для себя все преимущества жизни в этой удивительной стране.</p>
            <h3 class="text-xl font-semibold mb-2 mt-5"> 📞 Свяжитесь с нами:
              Не теряйте времени и возможностей . Свяжитесь с нашей командой сегодня, и дайте нам возможность сделать ваш выбор недвижимости в Болгарии максимально удачным и приятным!</h3>
          </div>
        </div>
      </div>
    </div>
  </div>
{/if}


<style>
    .container {
        background: transparent;
        display: flex;
        align-items: center;
        justify-content: center;
        min-height: 100vh;
        min-width: 100%;
        margin-top: 50px;


    }
    .content {
        background-color: rgba(0, 0, 0, 0.7); /* Черный цвет с прозрачностью 0.5 */
        padding: 100px;
        border-radius: 20px;
        box-shadow: 0 0 10px rgba(0, 0, 0, 0.5);
        margin: 10px;


    }
    .geo-arrow {
        fill: none;
        stroke: #fff;
        stroke-width: 2;
        stroke-miterlimit: 10

    }



    body {
        background: linear-gradient(#3800e7, #8a15ff);
        height: 100vh;
        font-size: calc(14px + (26 - 14) * ((100vw - 300px) / (1600 - 300)));
        font-family: "DM Mono", monospace;
        font-weight: 300;
        overflow: hidden;
        color: white;
        text-align: center;
    }

    h1 {
        font-size: 3em;
        margin-bottom: 0.2em;
    }

    h2 {
        font-size: 2em;
    }

    .main {
        height: 100vh;
        display: flex;
        flex-direction: column;
        flex-wrap: wrap;
        position: relative;
        justify-content: center;
        align-items: center;

    }

    .main:before,
    .main:after {
        content: "";
        display: block;
        position: absolute;
        z-index: -3;
    }

    .main:before {
        right: 0;
        bottom: -19;
        height: 30em;
        width: 30em;
        border-radius: 30em;
        background: linear-gradient(#3800e7, #8a15ff);
        align-self: flex-end;
        animation: gradient-fade 8s ease-in-out 3s infinite alternate;

    }

    .main:after {
        top: 0;
        left: 30;
        height: 10em;
        width: 10em;
        border-radius: 10em;
        background: linear-gradient(#3800e7, #8a15ff);
        animation: gradient-fade-alt 6s ease-in-out 3s infinite alternate;

    }

    .main__text-wrapper {
        position: relative;
        padding: 2em;
        z-index: 1;


    }

    .main__text-wrapper:before,
    .main__text-wrapper:after {
        content: "";
        display: block;
        position: absolute;


    }

    .main__text-wrapper:before {
        z-index: -1;
        top: -3em;
        right: -3em;
        width: 13em;
        height: 13em;
        opacity: 0.7;
        border-radius: 13em;
        background: linear-gradient(#15e0ff, #8a15ff);
        animation: rotation 7s linear infinite;

    }

    .main__text-wrapper:after {
        bottom: -10em;
        width: 10em;
        height: 10em;
        border-radius: 20em;
        background: linear-gradient(#d000c5, #8a15ff);
        animation: rotation 7s linear infinite;


    }

    .arrow {
        z-index: 1000;
        opacity: 0.5;
        position: absolute;
    }

    .arrow--top {
        top: 0;
        left: -7em;
    }

    .arrow--bottom {
        bottom: 0;
        right: 3em;
    }

    .circle {
        transform: translate(50%, -50%) rotate(0deg);
        transform-origin: center;
    }

    .circle--ltblue {
        height: 20em;
        width: 20em;
        border-radius: 20em;
        background: linear-gradient(#15e0ff, #3800e7);
        z-index: -50;

    }

    .backdrop {
        position: absolute;
        width: 100vw;
        height: 100vh;
        display: block;
        background-color: pink;

    }

    .dotted-circle {
        position: absolute;
        top: 0;
        right: 0;
        opacity: 0.3;
        animation: rotation 38s linear infinite;

    }

    @keyframes draw {
        from {
            stroke-dashoffset: 1000;
        }

        to {
            stroke-dashoffset: 0;
        }
    }

    .item-to {
        animation-duration: 10s;
        animation-iteration-count: infinite;
        transform-origin: bottom;
    }

    .bounce-1 {
        animation-name: bounce-1;
        animation-timing-function: ease;

    }

    .bounce-2 {
        animation-name: bounce-2;
        animation-timing-function: ease;
    }

    .bounce-3 {
        animation-name: bounce-3;
        animation-timing-function: ease;
    }

    @keyframes bounce-1 {
        0% {
            transform: translateY(0);
        }
        50% {
            transform: translateY(50px);
        }
        100% {
            transform: translateY(0);
        }
    }

    @keyframes bounce-2 {
        0% {
            transform: translateY(0);
        }
        50% {
            transform: translateY(-30px);
        }
        100% {
            transform: translateY(0);
        }
    }

    @keyframes bounce-3 {
        0% {
            transform: translateY(0);
        }
        50% {
            transform: translateY(30px);
        }
        100% {
            transform: translateY(0);
        }
    }

    @keyframes rotation {
        from {
            transform: rotate(0deg);
        }
        to {
            transform: rotate(360deg);
        }
    }

    @keyframes gradient-fade {
        from {
            transform: translate(10%, -10%) rotate(0deg);
        }
        to {
            transform: translate(50%, -50%) rotate(360deg);
        }
    }

    @keyframes gradient-fade-alt {
        from {
            transform: translate(-20%, 20%) rotate(0deg);
        }
        to {
            transform: translate(-60%, 60%) rotate(360deg);
        }
    }

    @media screen and (max-width: 860px) {
        .main__text-wrapper:after {
            display: none;
        }
    }

</style>




