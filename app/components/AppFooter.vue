<template>
  <footer class="site-footer">
    <div class="footer-content">
      <div class="footer-brand">
        <div class="footer-logo">
          ⚽
        </div>

        <div>
          <small>FIFA WORLD CUP</small>
          <strong>Tracker 2026</strong>

          <p>
            Sigue equipos, partidos, predicciones y estadísticas
            del torneo.
          </p>
        </div>
      </div>

      <div class="footer-information">
        <section>
          <span>Plataforma</span>

          <p>Seguimiento del Mundial 2026</p>
          <p>Predicciones y favoritos</p>
          <p>Estadísticas del campeonato</p>
        </section>

        <section>
          <span>Torneo</span>

          <p>Estados Unidos</p>
          <p>México</p>
          <p>Canadá</p>
        </section>

        <section>
          <span>Tecnologías</span>

          <p>Nuxt y Vue</p>
          <p>Firebase</p>
          <p>TypeScript</p>
        </section>
      </div>
    </div>

    <div class="footer-bottom">
      <p>
        © 2026 World Cup Tracker. Proyecto académico.
      </p>

      <div class="footer-status">
        <span class="status-dot" />
        <p>Plataforma disponible</p>
      </div>
    </div>
  </footer>
</template>

<style scoped>
.site-footer {
  color: #ffffff;
  background:
    linear-gradient(
      145deg,
      #080a09 0%,
      #101410 100%
    );
  border-top: 3px solid #9dca53;
}

.footer-content {
  display: grid;
  grid-template-columns: minmax(270px, 1fr) 1.4fr;
  gap: 80px;
  width: min(1180px, calc(100% - 48px));
  padding: 56px 0 45px;
  margin: 0 auto;
}

.footer-brand {
  display: flex;
  gap: 15px;
  align-items: flex-start;
}

.footer-logo {
  display: grid;
  width: 50px;
  height: 50px;
  flex: 0 0 auto;
  font-size: 23px;
  place-items: center;
  border: 1px solid rgba(157, 202, 83, 0.3);
  border-radius: 15px;
  background: rgba(157, 202, 83, 0.09);
}

.footer-brand small,
.footer-brand strong {
  display: block;
}

.footer-brand small {
  margin-bottom: 3px;
  font-size: 9px;
  font-weight: 900;
  color: #9dca53;
  letter-spacing: 1.6px;
}

.footer-brand strong {
  font-size: 19px;
}

.footer-brand p {
  max-width: 330px;
  margin: 14px 0 0;
  font-size: 12px;
  line-height: 1.7;
  color: rgba(255, 255, 255, 0.55);
}

.footer-information {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 35px;
}

.footer-information section > span {
  display: block;
  margin-bottom: 17px;
  font-size: 10px;
  font-weight: 900;
  color: #9dca53;
  text-transform: uppercase;
  letter-spacing: 1.4px;
}

.footer-information p {
  margin: 0 0 10px;
  font-size: 12px;
  color: rgba(255, 255, 255, 0.58);
}

.footer-bottom {
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: min(1180px, calc(100% - 48px));
  padding: 19px 0;
  margin: 0 auto;
  border-top: 1px solid rgba(255, 255, 255, 0.09);
}

.footer-bottom p {
  margin: 0;
  font-size: 10px;
  color: rgba(255, 255, 255, 0.42);
}

.footer-status {
  display: flex;
  gap: 9px;
  align-items: center;
}

.status-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: #9dca53;
  box-shadow: 0 0 9px rgba(157, 202, 83, 0.55);
}

@media (max-width: 800px) {
  .footer-content {
    grid-template-columns: 1fr;
    gap: 42px;
  }

  .footer-information {
    gap: 25px;
  }
}

@media (max-width: 560px) {
  .footer-content,
  .footer-bottom {
    width: min(100% - 32px, 1180px);
  }

  .footer-information {
    grid-template-columns: 1fr;
  }

  .footer-bottom {
    display: grid;
    gap: 12px;
  }
}
</style>