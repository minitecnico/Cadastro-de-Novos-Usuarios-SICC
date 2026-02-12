<script setup>
import { ref, onMounted, computed } from 'vue';
import { jsPDF } from "jspdf";
import { supabase } from './supabase'; 

// --- ESTADOS E REATIVIDADE ---
const FINALIZADO = ref(false);
const carregando = ref(false); // Adicionado para animação
const arquivoOriginal = ref(null);
const arquivoNome = ref('');
const arquivoPreview = ref(null);

const form = ref({
  nome: '', 
  cpf: '', 
  email: '', 
  telefone: '', 
  uf: '', 
  cidade: '', 
  orgao: '', 
  orgaoUrl: '', 
  secretaria: '', 
  cargo: ''
});

const ufs = ref([]);
const cidades = ref([]);

const SECRETARIAS = [
  "ADMINISTRAÇÃO", "EDUCAÇÃO", "DESENVOLVIMENTO SOCIAL",
  "SAÚDE", "CULTURA, ESPORTE e TURISMO", "URBANISMO e INFRAESTRUTURA",
  "AGRICULTURA", "PLANEJAMENTO"
];

const LISTA_ORGAOS = [
  { nome: "Prefeitura Municipal de Almadina", url: "https://almadina.compras.app.br/", cidade: "Almadina", uf: "BA" },
  { nome: "Prefeitura Municipal de Anagé", url: "https://anage.compras.app.br/", cidade: "Anagé", uf: "BA" },
  { nome: "Câmara Municipal de Anagé", url: "https://camaraanage.compras.app.br/", cidade: "Anagé", uf: "BA" },
  { nome: "Prefeitura Municipal de Apuarema", url: "https://apuarema.compras.app.br/", cidade: "Apuarema", uf: "BA" },
  { nome: "Prefeitura Municipal de Belo Campo", url: "https://belocampo.compras.app.br/", cidade: "Belo Campo", uf: "BA" },
  { nome: "Prefeitura Municipal de Bom Jesus da Serra", url: "https://bomjesusdaserra.compras.app.br/", cidade: "Bom Jesus da Serra", uf: "BA" },
  { nome: "Prefeitura Municipal de Caculé", url: "https://cacule.compras.app.br/", cidade: "Caculé", uf: "BA" },
  { nome: "Prefeitura Municipal de Caetanos", url: "https://caetanos.compras.app.br/", cidade: "Caetanos", uf: "BA" },
  { nome: "Prefeitura Municipal de Camacan", url: "https://camacan.compras.app.br/", cidade: "Camacan", uf: "BA" },
  { nome: "Câmara Municipal de Eunápolis", url: "https://camaraeunapolis.compras.app.br/", cidade: "Eunápolis", uf: "BA" },
  { nome: "Câmara Municipal de Ilhéus", url: "https://camarailheus.compras.app.br/", cidade: "Ilhéus", uf: "BA" },
  { nome: "Prefeitura Municipal de Ibicaraí", url: "https://ibicarai.compras.app.br/", cidade: "Ibicaraí", uf: "BA" },
  { nome: "Prefeitura Municipal de Ibicuí", url: "https://ibicui.compras.app.br/", cidade: "Ibicuí", uf: "BA" },
  { nome: "Prefeitura Municipal de Itabela", url: "https://itabela.compras.app.br/", cidade: "Itabela", uf: "BA" },
  { nome: "Prefeitura Municipal de Itajuípe", url: "https://itajuipe.compras.app.br/", cidade: "Itajuípe", uf: "BA" },
  { nome: "SAAE - Itajuipe", url: "https://saaeitajuipe.compras.app.br/", cidade: "Itajuípe", uf: "BA" },
  { nome: "Prefeitura Municipal de Itamaraju", url: "https://itamaraju.compras.app.br/", cidade: "Itamaraju", uf: "BA" },
  { nome: "Prefeitura Municipal de Itapebi", url: "https://itapebi.compras.app.br/", cidade: "Itapebi", uf: "BA" },
  { nome: "Prefeitura Municipal de Itaquara", url: "https://itaquara.compras.app.br/", cidade: "Itaquara", uf: "BA" },
  { nome: "Prefeitura Municipal de Itororó", url: "https://itororo.compras.app.br/", cidade: "Itororó", uf: "BA" },
  { nome: "Prefeitura Municipal de Ituaçu", url: "https://ituacu.compras.app.br/", cidade: "Ituaçu", uf: "BA" },
  { nome: "Prefeitura Municipal de Maetinga", url: "https://maetinga.compras.app.br/", cidade: "Maetinga", uf: "BA" },
  { nome: "Prefeitura Municipal de Mascote", url: "https://mascote.compras.app.br/", cidade: "Mascote", uf: "BA" },
  { nome: "Prefeitura Municipal de Mirante", url: "https://mirante.compras.app.br/", cidade: "Mirante", uf: "BA" },
  { nome: "Prefeitura Municipal de Nova Viçosa", url: "https://novavicosa.compras.app.br/", cidade: "Nova Viçosa", uf: "BA" },
  { nome: "Prefeitura Municipal de Pau Brasil", url: "https://paubrasil.compras.app.br/", cidade: "Pau Brasil", uf: "BA" },
  { nome: "Prefeitura Municipal de Potiraguá", url: "https://potiragua.compras.app.br/", cidade: "Potiraguá", uf: "BA" },
  { nome: "Prefeitura Municipal de Prado", url: "https://prado.compras.app.br/", cidade: "Prado", uf: "BA" },
  { nome: "Prefeitura Municipal de Rio do Antônio", url: "https://riodoantonio.compras.app.br/", cidade: "Rio do Antônio", uf: "BA" },
  { nome: "Prefeitura Municipal de Santa Cruz da Vitória", url: "https://santacruzdavitoria.compras.app.br/", cidade: "Santa Cruz da Vitória", uf: "BA" },
  { nome: "Prefeitura Municipal de Santa Luzia", url: "https://santaluzia.compras.app.br/", cidade: "Santa Luzia", uf: "BA" },
  { nome: "Prefeitura Municipal de Tremedal", url: "https://tremedal.compras.app.br/", cidade: "Tremedal", uf: "BA" },
  { nome: "Prefeitura Municipal de Urandi", url: "https://urandi.compras.app.br/", cidade: "Urandi", uf: "BA" },
  { nome: "Prefeitura Municipal de Wenceslau Guimarães", url: "https://wg.compras.app.br/", cidade: "Wenceslau Guimarães", uf: "BA" },
];

onMounted(async () => {
  const res = await fetch('https://servicodados.ibge.gov.br/api/v1/localidades/estados?orderBy=nome');
  ufs.value = await res.json();
});

const handleUF = async () => {
  form.value.cidade = '';
  const res = await fetch(`https://servicodados.ibge.gov.br/api/v1/localidades/estados/${form.value.uf}/municipios`);
  cidades.value = await res.json();
};

const orgaosFiltrados = computed(() => {
  if (!form.value.cidade || !form.value.uf) return [];
  return LISTA_ORGAOS.filter(o => o.cidade.toLowerCase() === form.value.cidade.toLowerCase() && o.uf === form.value.uf);
});

const handleFileUpload = (e) => {
  const file = e.target.files[0];
  if (file && file.size <= 10 * 1024 * 1024) {
    arquivoOriginal.value = file;
    arquivoNome.value = file.name;
    if (file.type.startsWith('image/')) arquivoPreview.value = URL.createObjectURL(file);
  } else if (file) {
    alert("O arquivo excede 10MB.");
  }
};

const finalizar = async () => {
  if (!arquivoOriginal.value) {
    alert("Por favor, anexe a sua assinatura.");
    return;
  }
  
  carregando.value = true;
  try {
    let assinaturaUrl = null;
    if (arquivoOriginal.value) {
      const fileExt = arquivoOriginal.value.name.split('.').pop();
      const fileName = `${form.value.cpf}_${Date.now()}.${fileExt}`;
      const filePath = `public/${fileName}`;
      const { error: uploadError } = await supabase.storage.from('assinaturas').upload(filePath, arquivoOriginal.value);
      if (uploadError) throw uploadError;
      const { data: urlData } = supabase.storage.from('assinaturas').getPublicUrl(filePath);
      assinaturaUrl = urlData.publicUrl;
    }
    const { error: dbError } = await supabase.from('cadastros_sicc').insert([{ ...form.value, assinatura_url: assinaturaUrl }]);
    if (dbError) throw dbError;
    FINALIZADO.value = true;
    window.scrollTo({ top: 0, behavior: 'smooth' });
  } catch (err) {
    alert("Erro ao salvar: " + err.message);
  } finally {
    carregando.value = false;
  }
};

const reset = () => { 
  FINALIZADO.value = false; 
  arquivoPreview.value = null; 
  arquivoOriginal.value = null;
  arquivoNome.value = ''; 
  form.value = { nome: '', cpf: '', email: '', telefone: '', uf: '', cidade: '', orgao: '', orgaoUrl: '', secretaria: '', cargo: '' };
};

const gerarPDF = () => {
  const doc = new jsPDF();
  doc.text("Comprovante de Cadastro SICC", 20, 20);
  doc.text(`Nome: ${form.value.nome}`, 20, 40);
  doc.text(`Órgão: ${form.value.orgao}`, 20, 50);
  doc.text(`Link: ${form.value.orgaoUrl}`, 20, 60);
  doc.save(`cadastro_${form.value.cpf}.pdf`);
};

const exportarCSV = async () => {
  const { data, error } = await supabase.from('cadastros_sicc').select('*');
  if (error) { alert("Erro ao exportar: " + error.message); return; }
  const headers = ["Nome", "CPF", "Email", "Telefone", "Cidade", "Orgao", "Secretaria", "Cargo", "Data"];
  const rows = data.map(i => [i.nome, i.cpf, i.email, i.telefone, i.cidade, i.orgao, i.secretaria, i.cargo, new Date(i.criado_em).toLocaleDateString('pt-BR')]);
  let csv = "data:text/csv;charset=utf-8,\uFEFF" + headers.join(";") + "\r\n" + rows.map(r => r.join(";")).join("\r\n");
  const link = document.createElement("a");
  link.setAttribute("href", encodeURI(csv));
  link.setAttribute("download", "cadastros_sicc.csv");
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};
</script>

<template>
  <div class="page-bg">
    <div class="main-card">
      <header class="banner">
        <h1>Cadastro de Novos Usuários - SICC</h1>
      </header>

      <div v-if="FINALIZADO" class="success-screen">
        <div class="alert-box">
          <h2>⚠️ ATENÇÃO</h2>
          <p>O cadastro do usuário e a liberação de acesso foram realizados.</p>
          <div class="credentials">
            <p><strong>Link:</strong> <a v-if="form.orgaoUrl" :href="form.orgaoUrl" target="_blank">{{ form.orgaoUrl }}</a><span v-else>Link não disponível</span></p>
            <p><strong>Login:</strong> {{ form.cpf }} | <strong>Senha:</strong> 123456</p>
          </div>
          <div class="btn-group">
            <button @click="disabled" class="btn-pdf"> </button>
            <button @click="disabled" class="btn-csv"> </button>
            <button @click="reset" class="btn-new">NOVO CADASTRO</button>
          </div>
        </div>
      </div>

      <form v-else @submit.prevent="finalizar" class="form-body">
        <div class="grid-2">
          <input v-model="form.nome" required placeholder="NOME COMPLETO">
          <input v-model="form.cpf" required placeholder="CPF">
          <input v-model="form.email" type="email" required placeholder="EMAIL">
          <input v-model="form.telefone" required placeholder="TELEFONE">
        </div>

        <div class="grid-location">
          <select v-model="form.uf" @change="handleUF" required>
            <option value="">UF</option>
            <option v-for="u in ufs" :key="u.id" :value="u.sigla">{{ u.sigla }}</option>
          </select>
          <input v-model="form.cidade" list="cids" required placeholder="CIDADE (SELECIONE OU DIGITE NOVA)">
          <datalist id="cids">
            <option v-for="c in cidades" :key="c.id" :value="c.nome" />
          </datalist>
        </div>

        <div v-if="orgaosFiltrados.length" class="selection-area">
          <label>SELECIONE O ÓRGÃO VINCULADO:</label>
          <div class="grid-2">
            <button v-for="o in orgaosFiltrados" :key="o.nome" type="button" 
              @click="form.orgao = o.nome; form.orgaoUrl = o.url"
              :class="{ active: form.orgao === o.nome }">{{ o.nome }}</button>
          </div>
        </div>

        <div class="selection-area">
          <label>FAÇO PARTE DA SECRETARIA DE:</label>
          <div class="grid-2">
            <button v-for="s in SECRETARIAS" :key="s" type="button" 
              @click="form.secretaria = s"
              :class="{ active: form.secretaria === s }">{{ s }}</button>
          </div>
          <input v-model="form.secretaria" required class="full-input" placeholder="OU DIGITE A SECRETARIA">
        </div>

        <input v-model="form.cargo" required class="full-input" placeholder="CARGO / FUNÇÃO">

        <section class="signature-section">
          <h2>⚠️ ⚠️ Para cadastrar sua assinatura, siga as instruções: <span class="req">*</span></h2>
          <ol>
            <li>Assine em uma folha branca.</li>
            <li>Tire uma foto nítida.</li>
            <li>Faça o upload abaixo.</li>
          </ol>
          <div class="upload-zone">
            <svg class="icon-file" viewBox="0 0 24 24">
              <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"/>
              <polyline points="14 2 14 8 20 8"/>
              <path d="M10 18l5-5h-3V9h-4v4H5l5 5z"/>
            </svg>
            <p>PDF, Document ou Imagem (Máx 10 MB).</p>
            <div class="upload-action">
              <label class="btn-file">
                <input type="file" hidden @change="handleFileUpload" accept="image/*,application/pdf">
                <span>⤒ Adicionar arquivo</span>
              </label>
              <span v-if="arquivoNome" class="file-name">{{ arquivoNome }}</span>
            </div>
            <img v-if="arquivoPreview" :src="arquivoPreview" class="preview">
          </div>
        </section>

        <button type="submit" :disabled="carregando" class="btn-submit">
          <span v-if="!carregando">FINALIZAR CADASTRO</span>
          <span v-else class="loader"></span>
        </button>
      </form>
    </div>
  </div>
</template>

<style scoped>
.page-bg { background: #f1f5f9; min-height: 100vh; padding: 40px 20px; font-family: 'Inter', sans-serif; }
.main-card { max-width: 750px; margin: 0 auto; background: white; border-radius: 20px; box-shadow: 0 10px 30px rgba(0,0,0,0.1); overflow: hidden; }
.banner { background: #2563eb; padding: 35px; text-align: center; }
.banner h1 { color: white; margin: 0; font-size: 24px; font-weight: 800; font-style: italic; }
.form-body { padding: 40px; }
.grid-2 { display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 15px; margin-bottom: 20px; }
.grid-location { display: grid; grid-template-columns: 100px 1fr; gap: 15px; margin-bottom: 20px; }

input, select, button, textarea { font-family: 'Inter', sans-serif; font-size: 14px; }
input, select { padding: 14px; border: 1px solid #e2e8f0; border-radius: 10px; width: 100%; box-sizing: border-box; }
.full-input { width: 100%; margin-bottom: 20px; box-sizing: border-box; }

.selection-area label { display: block; font-size: 12px; font-weight: 700; color: #475569; margin-bottom: 10px; text-align: left; }
.selection-area button { padding: 12px 15px; border: 1px solid #e2e8f0; border-radius: 8px; background: white; cursor: pointer; font-size: 11px; text-align: left; width: 100%; }
.selection-area button.active { border-color: #2563eb; background: #eff6ff; color: #2563eb; font-weight: 600; }

.signature-section { background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 15px; padding: 25px; margin-bottom: 30px; text-align: left;}
.req { color: red; }
ol { font-size: 13px; color: #64748b; font-style: italic; padding-left: 20px; }
.upload-zone { display: flex; flex-direction: column; align-items: center; text-align: center; margin-top: 15px; }
.icon-file { width: 60px; stroke: #000; fill: none; margin-bottom: 10px; }
.btn-file { border: 1px solid #e2e8f0; padding: 10px 20px; border-radius: 8px; cursor: pointer; color: #2563eb; font-weight: 600; background: #fff; }
.preview { height: 60px; margin-top: 15px; border: 1px solid #ddd; padding: 4px; background: #fff; }

.btn-submit { width: 100%; padding: 20px; background: #2563eb; color: white; border: none; border-radius: 12px; font-weight: 800; cursor: pointer; display: flex; justify-content: center; align-items: center; }
.btn-submit:disabled { background: #94a3b8; cursor: not-allowed; }

.loader { width: 20px; height: 20px; border: 3px solid #FFF; border-bottom-color: transparent; border-radius: 50%; display: inline-block; animation: rotation 1s linear infinite; }
@keyframes rotation { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }

.success-screen { padding: 40px; }
.alert-box { background: #fffbeb; border: 1px solid #fde68a; padding: 25px; border-radius: 15px; text-align: left; }
.credentials { background: white; padding: 15px; border-radius: 10px; margin: 15px 0; border: 1px solid #eee; }
.btn-group { display: flex; gap: 10px; }
.btn-pdf { flex: 1; padding: 15px; background: #059669; color: white; border: none; border-radius: 8px; font-weight: bold; cursor: pointer; }
.btn-csv { flex: 1; padding: 15px; background: #1e293b; color: white; border: none; border-radius: 8px; font-weight: bold; cursor: pointer; }
.btn-new { flex: 1; padding: 15px; background: #2563eb; color: white; border: none; border-radius: 8px; font-weight: bold; cursor: pointer; }
.file-name { font-size: 11px; color: #2563eb; margin-top: 5px; }

@media (max-width: 600px) {
  .grid-2 { grid-template-columns: 1fr; }
  .grid-location { grid-template-columns: 70px 1fr; }
  .btn-group { flex-direction: column; }
}
</style>
