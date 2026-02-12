import Link from "next/link";

export default function Home() {
	return (
		<div className="min-h-screen bg-zinc-50 font-sans text-zinc-900 dark:bg-black dark:text-white">
			<main className="mx-auto flex w-full max-w-6xl flex-col gap-16 px-6 py-16 sm:px-10">
				<section className="rounded-3xl bg-white p-10 shadow-sm ring-1 ring-zinc-100 dark:bg-zinc-950 dark:ring-zinc-800">
					<div className="flex flex-col gap-8 lg:flex-row lg:items-center lg:justify-between">
						<div className="max-w-2xl">
							<p className="mb-3 inline-flex items-center rounded-full bg-emerald-50 px-3 py-1 text-sm font-medium text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300">
								Plataforma de créditos de carbono verificables
							</p>
							<h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">
								eCO2: registra, verifica y emite créditos de carbono con confianza
							</h1>
							<p className="mt-4 text-base text-zinc-600 dark:text-zinc-300">
								Centraliza proyectos ambientales, trazabilidad y emisión de créditos en un
								ecosistema transparente para empresas y validadores.
							</p>
						</div>
						<div className="flex flex-col gap-3">
							<Link
								href="/project/new"
								className="inline-flex items-center justify-center rounded-md bg-emerald-600 px-6 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-emerald-700"
							>
								Registrar nuevo proyecto
							</Link>
							<Link
								href="/companies/new"
								className="inline-flex items-center justify-center rounded-md border border-emerald-600 px-6 py-3 text-sm font-semibold text-emerald-700 transition hover:bg-emerald-50 dark:text-emerald-300 dark:hover:bg-emerald-950"
							>
								Registrar empresa
							</Link>
						</div>
					</div>
				</section>

				<section className="grid gap-6 lg:grid-cols-3">
					<div className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-zinc-100 dark:bg-zinc-950 dark:ring-zinc-800">
						<p className="text-sm font-medium text-zinc-500 dark:text-zinc-400">
							Créditos emitidos
						</p>
						<p className="mt-3 text-3xl font-semibold">1,284,500</p>
						<p className="mt-2 text-xs text-zinc-500 dark:text-zinc-400">
							Total histórico
						</p>
					</div>
					<div className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-zinc-100 dark:bg-zinc-950 dark:ring-zinc-800">
						<p className="text-sm font-medium text-zinc-500 dark:text-zinc-400">
							Créditos quemados
						</p>
						<p className="mt-3 text-3xl font-semibold">392,200</p>
						<p className="mt-2 text-xs text-zinc-500 dark:text-zinc-400">
							Compensados por empresas
						</p>
					</div>
					<div className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-zinc-100 dark:bg-zinc-950 dark:ring-zinc-800">
						<p className="text-sm font-medium text-zinc-500 dark:text-zinc-400">
							Proyectos activos
						</p>
						<p className="mt-3 text-3xl font-semibold">128</p>
						<p className="mt-2 text-xs text-zinc-500 dark:text-zinc-400">
							Verificados y en curso
						</p>
					</div>
				</section>

				{/* <section className="grid gap-8 rounded-3xl bg-white p-10 shadow-sm ring-1 ring-zinc-100 dark:bg-zinc-950 dark:ring-zinc-800 lg:grid-cols-2 lg:items-center">
					<div>
						<h2 className="text-2xl font-semibold">Empresas comprometidas</h2>
						<p className="mt-4 text-base text-zinc-600 dark:text-zinc-300">
							Accede a proyectos verificados, adquiere créditos con trazabilidad y
							reporta tu impacto climático con métricas claras.
						</p>
						<div className="mt-6 flex flex-col gap-3 sm:flex-row">
							<Link
								href="/companies/dashboard"
								className="inline-flex items-center justify-center rounded-md bg-zinc-900 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-zinc-800 dark:bg-white dark:text-zinc-900"
							>
								Ver panel de empresas
							</Link>
							<Link
								href="/companies/new"
								className="inline-flex items-center justify-center rounded-md border border-zinc-300 px-5 py-2.5 text-sm font-semibold text-zinc-700 transition hover:bg-zinc-100 dark:border-zinc-700 dark:text-zinc-200 dark:hover:bg-zinc-900"
							>
								Crear perfil empresarial
							</Link>
						</div>
					</div>
					<div className="grid gap-4 sm:grid-cols-2">
						<div className="rounded-2xl border border-zinc-200 p-4 text-sm text-zinc-600 dark:border-zinc-800 dark:text-zinc-300">
							<p className="font-semibold text-zinc-900 dark:text-white">Integración rápida</p>
							<p className="mt-2">Conecta tu wallet y empieza a compensar.</p>
						</div>
						<div className="rounded-2xl border border-zinc-200 p-4 text-sm text-zinc-600 dark:border-zinc-800 dark:text-zinc-300">
							<p className="font-semibold text-zinc-900 dark:text-white">Reportes auditables</p>
							<p className="mt-2">Métricas listas para tus reportes ESG.</p>
						</div>
						<div className="rounded-2xl border border-zinc-200 p-4 text-sm text-zinc-600 dark:border-zinc-800 dark:text-zinc-300">
							<p className="font-semibold text-zinc-900 dark:text-white">Mercado transparente</p>
							<p className="mt-2">Historial de emisiones y quemas accesible.</p>
						</div>
						<div className="rounded-2xl border border-zinc-200 p-4 text-sm text-zinc-600 dark:border-zinc-800 dark:text-zinc-300">
							<p className="font-semibold text-zinc-900 dark:text-white">Soporte dedicado</p>
							<p className="mt-2">Acompañamiento para equipos de sostenibilidad.</p>
						</div>
					</div>
				</section> */}
			</main>
		</div>
	);
}
