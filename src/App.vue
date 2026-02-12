<script setup>
import { ref, onMounted, computed } from 'vue';
import { jsPDF } from "jspdf";
import { supabase } from './supabase'; 

// --- ESTADOS E REATIVIDADE ---
const FINALIZADO = ref(false);
const carregando = ref(false);
const dragAtivo = ref(false);

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

const processarArquivo = (file) => {
  if (!file) return;
  if (file.size > 5 * 1024 * 1024) {
    alert("O arquivo excede o limite de 5MB.");
    return;
  }
  arquivoOriginal.value = file;
  arquivoNome.value = file.name;
  if (file.type.startsWith('image/')) {
    arquivoPreview.value = URL.createObjectURL(file);
  } else {
    arquivoPreview.value = 'https://cdn-icons-png.flaticon.com/512/337/337946.png';
  }
};

const handleFileUpload = (e) => processarArquivo(e.target.files[0]);
const handleDrop = (e) => { dragAtivo.value = false; processarArquivo(e.dataTransfer.files[0]); };
const resetArquivo = () => { arquivoOriginal.value = null; arquivoNome.value = ''; arquivoPreview.value = null; };

const finalizar = async () => {
  if (!form.value.orgao) return alert("Selecione o Órgão Vinculado!");
  if (!form.value.secretaria) return alert("Selecione ou digite a Secretaria!");
  if (!arquivoOriginal.value) return alert("A assinatura é obrigatória!");

  carregando.value = true;
  try {
    let assinaturaUrl = null;
    const fileExt = arquivoOriginal.value.name.split('.').pop();
    const fileName = `${form.value.cpf}_${Date.now()}.${fileExt}`;
    const filePath = `public/${fileName}`;

    const { error: uploadError } = await supabase.storage.from('assinaturas').upload(filePath, arquivoOriginal.value);
    if (uploadError) throw uploadError;

    const { data: urlData } = supabase.storage.from('assinaturas').getPublicUrl(filePath);
    assinaturaUrl = urlData.publicUrl;

    const { error: dbError } = await supabase.from('cadastros_sicc').insert([{ ...form.value, assinatura_url: assinaturaUrl }]);
    if (dbError) throw dbError;

    FINALIZADO.value = true;
    window.scrollTo({ top: 0, behavior: 'smooth' });
  } catch (err) {
    alert("Erro: " + err.message);
  } finally {
    carregando.value = false;
  }
};

const reset = () => { 
  FINALIZADO.value = false; 
  resetArquivo();
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
  if (error) return alert(error.message);
  const headers = ["Nome", "CPF", "Cidade", "Orgao", "Secretaria", "Data"];
  const rows = data.map(i => [i.nome, i.cpf, i.cidade, i.orgao, i.secretaria, new Date(i.criado_em).toLocaleDateString()]);
  let csv = "data:text/csv;charset=utf-8,\uFEFF" + headers.join(";") + "\r\n" + rows.map(r => r.join(";")).join("\r\n");
  const link = document.createElement("a");
  link.setAttribute("href", encodeURI(csv));
  link.setAttribute("download", "relatorio.csv");
  link.click();
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
          <h2>Bem vindo ao SICC📄</h2>
          <p> O seu cadastro foi realizado com sucesso🎉!</p>
          <div class="credentials">
            <p><strong>Link:</strong> <a v-if="form.orgaoUrl" :href="form.orgaoUrl" target="_blank">{{ form.orgaoUrl }}</a><span v-else>Link não disponível</span></p>
            <p><strong>Login:</strong> {{ form.cpf }} | <strong>Senha:</strong> 123456</p>
          </div>
          <div class="btn-group">
            <button @click="disable" class="btn-pdf">📥 PDF</button>
            <button @click="disable" class="btn-csv">📊 PLANILHA</button>
            <button @click="reset" class="btn-new">NOVO</button>
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
          <input v-model="form.cidade" list="cids" required placeholder="CIDADE (OU DIGITE NOVA)">
          <datalist id="cids"><option v-for="c in cidades" :key="c.id" :value="c.nome" /></datalist>
        </div>

        <div v-if="orgaosFiltrados.length" class="selection-area">
          <label>ÓRGÃO VINCULADO: <span class="req">*</span></label>
          <div class="grid-2">
            <button v-for="o in orgaosFiltrados" :key="o.nome" type="button" @click="form.orgao = o.nome; form.orgaoUrl = o.url" :class="{ active: form.orgao === o.nome }">{{ o.nome }}</button>
          </div>
        </div>

        <div class="selection-area">
          <label>SECRETARIA: <span class="req">*</span></label>
          <div class="grid-2">
            <button v-for="s in SECRETARIAS" :key="s" type="button" @click="form.secretaria = s" :class="{ active: form.secretaria === s }">{{ s }}</button>
          </div>
          <input v-model="form.secretaria" required class="full-input" placeholder="OU DIGITE A SECRETARIA">
        </div>

        <input v-model="form.cargo" required class="full-input" placeholder="CARGO / FUNÇÃO">

        <section class="signature-section">
  <div class="signature-header">
    <h2>✍🏼 Assinatura do Usuário <span class="req">*</span></h2>
    <p class="instructions-text">Assine em papel branco, tire uma foto nítida e anexe abaixo.</p>
  </div>

  <div 
    class="upload-container" 
    :class="{ 'has-file': arquivoOriginal, 'drag-active': dragAtivo }"
    @dragover.prevent="dragAtivo = true"
    @dragleave.prevent="dragAtivo = false"
    @drop.prevent="handleDrop"
  >
    <div v-if="!arquivoPreview" class="upload-placeholder">
      <div class="dashed-box">
        <svg class="icon-upload" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M17 8l-5-5-5 5M12 3v12"/>
        </svg>
        <p>Tamanho max. 6MB</p>
        <p class="sub-text">Toque para selecionar</p>
      </div>
    </div>

    <div v-else class="preview-container">
      <img :src="arquivoPreview" class="signature-preview">
      <button type="button" @click="resetArquivo" class="btn-remove">✕</button>
    </div>

    <div class="upload-controls">
      <label class="btn-upload">
        <input type="file" hidden @change="handleFileUpload" accept="image/*,application/pdf">
        <span>{{ arquivoOriginal ? 'ALTERAR ASSINATURA' : 'SELECIONAR' }}</span>
      </label>
      <div v-if="arquivoNome" class="file-info">{{ arquivoNome }}</div>
    </div>
  </div>

        <button type="submit" :disabled="carregando" class="btn-submit">
          <span v-if="!carregando">FINALIZAR CADASTRO</span>
          <span v-else class="loader"></span>
        </button>
      </form>
    </div>
  </div>
</template>

<style scoped>
.page-bg { background: #f1f5f9; min-height: 100vh; padding: 20px; font-family: 'Inter', sans-serif; }
.main-card { max-width: 750px; margin: 0 auto; background: white; border-radius: 20px; box-shadow: 0 10px 30px rgba(0,0,0,0.1); overflow: hidden; }
.banner { background: #2563eb; padding: 30px; text-align: center; color: white; }
.banner h1 { margin: 0; font-size: 22px; font-weight: 800; font-style: italic; }
.form-body { padding: 30px; }
.grid-2 { display: grid; grid-template-columns: repeat(auto-fit, minmax(240px, 1fr)); gap: 12px; margin-bottom: 15px; }
.grid-location { display: grid; grid-template-columns: 80px 1fr; gap: 12px; margin-bottom: 15px; }

input, select { padding: 12px; border: 1px solid #e2e8f0; border-radius: 8px; width: 100%; box-sizing: border-box; }
.full-input { margin-bottom: 15px; }

.selection-area label { display: block; font-size: 11px; font-weight: 700; color: #475569; margin-bottom: 8px; text-transform: uppercase; }
.selection-area button { padding: 10px; border: 1px solid #e2e8f0; border-radius: 6px; background: white; cursor: pointer; font-size: 11px; width: 100%; text-align: left; }
.selection-area button.active { border-color: #2563eb; background: #eff6ff; color: #2563eb; font-weight: 600; }

.signature-section { 
  background: #ffffff; 
  border: 1px solid #e2e8f0; 
  border-radius: 12px; 
  padding: 25px; 
  margin: 20px 0; 
  text-align: center; 
}

.instructions-text { 
  font-size: 13px; 
  color: #64748b; 
  margin: 8px 0 20px 0; 
}

.upload-container { 
  display: flex; 
  flex-direction: column; 
  align-items: center; 
  justify-content: center; 
  gap: 15px; 
}

.upload-placeholder {
  border: 2px dashed #cbd5e1;
  border-radius: 12px;
  padding: 30px;
  width: 220px;
  background: #f8fafc;
  transition: all 0.2s ease;
  cursor: pointer;
}

.upload-container.drag-active .upload-placeholder { 
  border-color: #2563eb; 
  background: #eff6ff; 
  transform: scale(1.02);
}

.icon-upload { 
  width: 35px; 
  height: 35px;
  color: #64748b; 
  margin-bottom: 10px; 
}

.upload-placeholder p {
  margin: 0;
  font-size: 13px;
  font-weight: 600;
  color: #475569;
}

.signature-preview { 
  max-height: 120px; 
  max-width: 250px;
  border: 1px solid #e2e8f0;
  border-radius: 8px; 
  padding: 5px;
  background: white;
}

.preview-container { position: relative; display: inline-block; }

.btn-remove { 
  position: absolute; 
  top: -10px; 
  right: -10px; 
  background: #ef4444; 
  color: white; 
  border: none; 
  border-radius: 50%; 
  width: 24px; 
  height: 24px; 
  cursor: pointer; 
  font-size: 12px; 
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}

.btn-upload {
  background: #2563eb;
  color: white;
  padding: 12px 25px;
  border-radius: 8px;
  font-size: 12px;
  font-weight: 700;
  cursor: pointer;
  display: inline-block;
  transition: 0.2s;
}

.btn-upload:hover { background: #1d4ed8; }

.btn-submit { width: 100%; padding: 18px; background: #2563eb; color: white; border: none; border-radius: 10px; font-weight: 800; cursor: pointer; display: flex; justify-content: center; align-items: center; }
.btn-submit:disabled { background: #94a3b8; }

.loader { width: 18px; height: 18px; border: 3px solid #FFF; border-bottom-color: transparent; border-radius: 50%; animation: rotation 1s linear infinite; }
@keyframes rotation { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }

.success-screen { padding: 30px; }
.alert-box { background: #fffbeb; border: 1px solid #fde68a; padding: 20px; border-radius: 12px; }
.credentials { background: white; padding: 15px; border-radius: 8px; margin: 15px 0; border: 1px solid #eee; font-size: 13px; }
.btn-group { display: flex; gap: 8px; }
.btn-group button { flex: 1; padding: 12px; border: none; border-radius: 6px; color: white; font-weight: bold; cursor: pointer; font-size: 12px; }
.btn-pdf { background: #059669; }
.btn-csv { background: #1e293b; }
.btn-new { background: #2563eb; }
.req { color: red; }
</style>
