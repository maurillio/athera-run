'use client';

export default function OfflinePage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-orange-50 to-white p-4">
      <div className="max-w-md w-full text-center space-y-6">
        <div className="flex justify-center">
          <div className="w-24 h-24 rounded-full bg-orange-100 flex items-center justify-center">
            <svg
              className="w-12 h-12 text-orange-500"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M18.364 5.636a9 9 0 010 12.728m0 0l-2.829-2.829m2.829 2.829L21 21M15.536 8.464a5 5 0 010 7.072m0 0l-2.829-2.829m-4.243 2.829a4.978 4.978 0 01-1.414-2.83m-1.414 5.658a9 9 0 01-2.167-9.238m7.824 2.167a1 1 0 111.414 1.414m-1.414-1.414L3 3m8.293 8.293l1.414 1.414"
              />
            </svg>
          </div>
        </div>

        <div className="space-y-2">
          <h1 className="text-3xl font-bold text-gray-900">
            Você está offline
          </h1>
          <p className="text-gray-600">
            Parece que você perdeu a conexão com a internet.
          </p>
        </div>

        <div className="bg-orange-50 border border-orange-200 rounded-lg p-4 space-y-3">
          <h2 className="font-semibold text-gray-900 text-sm">
            Funcionalidades disponíveis offline:
          </h2>
          <ul className="text-left text-sm text-gray-700 space-y-2">
            <li className="flex items-start">
              <span className="text-green-500 mr-2">✓</span>
              <span>Visualizar seu plano de treino</span>
            </li>
            <li className="flex items-start">
              <span className="text-green-500 mr-2">✓</span>
              <span>Ver treinos já carregados</span>
            </li>
            <li className="flex items-start">
              <span className="text-green-500 mr-2">✓</span>
              <span>Consultar seu perfil</span>
            </li>
            <li className="flex items-start">
              <span className="text-orange-500 mr-2">○</span>
              <span>Marcar treinos como completos (sincroniza ao voltar online)</span>
            </li>
          </ul>
        </div>

        <div className="space-y-3">
          <button
            onClick={() => window.location.reload()}
            className="w-full bg-orange-500 hover:bg-orange-600 text-white font-medium py-3 px-4 rounded-lg transition-colors"
          >
            Tentar novamente
          </button>
          
          <button
            onClick={() => window.history.back()}
            className="w-full bg-white hover:bg-gray-50 text-gray-700 font-medium py-3 px-4 rounded-lg border border-gray-300 transition-colors"
          >
            Voltar
          </button>
        </div>

        <p className="text-xs text-gray-500">
          Seus dados estão salvos localmente e serão sincronizados quando a conexão for restabelecida.
        </p>
      </div>
    </div>
  );
}
