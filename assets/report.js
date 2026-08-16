// Render del reporte, compartido entre index.html (resultado inline tras /analizar) y
// plan/index.html (pagina publica y permanente del reporte, plan.marcasrentables.com/plan/?id=...).
// Un solo lugar para esta logica: evita que las dos paginas se desincronicen.

const REPORT_LABELS = {
	diagnosticoGeneral: 'Diagnóstico general',
	tusNumerosHoy: 'Tus números hoy',
	tuCuelloBotella: 'Tu cuello de botella',
	tuCaminoHacia3X: 'Tu camino hacia el 3X',
	queDebesHacerEstaSemana: 'Qué debes hacer esta semana',
	riesgosSiNoActuas: 'Riesgos si no actúas',
	mensajeFinalMentor: 'Mensaje final del mentor',
};

const CLOSING_CTA_URL = 'https://links.jaquefunnels.com/widget/booking/8RASvtZb30E9PjHapGkq';

function renderReport(reportEl, closingEl, analysis, closing, moneda, tipoCambio) {
	reportEl.innerHTML = '';

	if (moneda !== 'USD') {
		const nota = document.createElement('p');
		nota.className = 'report-note';
		nota.textContent = 'Hacemos los cálculos de este diagnóstico en dólares para estandarizar la metodología.';
		reportEl.appendChild(nota);
	}

	Object.entries(REPORT_LABELS).forEach(([key, label]) => {
		if (!analysis[key]) return;
		const block = document.createElement('div');
		block.className = 'report-block';
		const h2 = document.createElement('h2');
		h2.textContent = label;
		const p = document.createElement('p');
		p.textContent = analysis[key];
		block.appendChild(h2);
		block.appendChild(p);
		reportEl.appendChild(block);
	});

	closingEl.innerHTML = '';

	closing
		.split(/\n\s*\n/)
		.map((parrafo) => parrafo.trim())
		.filter(Boolean)
		.forEach((parrafo) => {
			const p = document.createElement('p');
			// La firma ("Atte: ...") es texto fijo, siempre la ultima linea, se marca
			// para que se vea como firma y no como un parrafo mas.
			if (parrafo.startsWith('Atte:')) {
				p.className = 'signature';
				p.textContent = parrafo;
				closingEl.appendChild(p);
				return;
			}
			// Resalta el rango de semanas (el único número clave que controlamos nosotros
			// en este texto, todo lo demás es literal fijo).
			const match = parrafo.match(/^(El plan que acabas de leer requiere entre )(\d+ y \d+)( semanas.*)$/);
			if (match) {
				p.appendChild(document.createTextNode(match[1]));
				const span = document.createElement('span');
				span.className = 'weeks';
				span.textContent = match[2];
				p.appendChild(span);
				p.appendChild(document.createTextNode(match[3]));
			} else {
				p.textContent = parrafo;
			}
			closingEl.appendChild(p);
		});

	const cta = document.createElement('a');
	cta.className = 'closing-cta';
	cta.href = CLOSING_CTA_URL;
	cta.target = '_blank';
	cta.rel = 'noopener noreferrer';
	cta.textContent = 'Agenda tu llamada de claridad';
	closingEl.appendChild(cta);

	if (tipoCambio && moneda !== 'USD') {
		const fecha = new Date(tipoCambio.fetchedAt).toLocaleDateString('es-CL');
		const fx = document.createElement('p');
		fx.className = 'fx-note';
		fx.textContent = `Tipo de cambio usado: 1 USD = ${tipoCambio.rate.toFixed(2)} ${moneda} (${fecha}).`;
		closingEl.appendChild(fx);
	}
}
