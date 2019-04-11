sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"sap/ui/core/routing/History",
	"sap/m/MessageBox",
	"sap/ui/model/json/JSONModel",
	"br/com/idxtecServicoArmazem/helpers/ProdutoHelpDialog",
	"br/com/idxtecServicoArmazem/services/Session"
], function(Controller, History, MessageBox, JSONModel, ProdutoHelpDialog, Session) {
	"use strict";

	return Controller.extend("br.com.idxtecServicoArmazem.controller.GravarServico", {
		onInit: function(){
			var oRouter = this.getOwnerComponent().getRouter();
			
			oRouter.getRoute("gravarservico").attachMatched(this._routerMatch, this);
			this.getView().addStyleClass(this.getOwnerComponent().getContentDensityClass());
			
			this._operacao = null;
			this._sPath = null;
			
			var oJSONModel = new JSONModel();
			this.getOwnerComponent().setModel(oJSONModel,"model");
		},
		
		getModel : function(sModel) {
			return this.getOwnerComponent().getModel(sModel);	
		},
		
		produtoReceived: function() {
			this.getView().byId("produto").setSelectedKey(this.getModel("model").getProperty("/Produto"));
		},
		
		handleSearchProduto: function(oEvent){
			var sInputId = oEvent.getParameter("id");
			ProdutoHelpDialog.handleValueHelp(this.getView(), sInputId, this);
		},
		
		_routerMatch: function(){
			var oParam = this.getOwnerComponent().getModel("parametros").getData();
			var oJSONModel = this.getOwnerComponent().getModel("model");
			var oModel = this.getOwnerComponent().getModel();
			var oViewModel = this.getOwnerComponent().getModel("view");
			
			this._operacao = oParam.operacao;
			this._sPath = oParam.sPath;
			
			this.getView().byId("produto").setValue(null);
			
			if (this._operacao === "incluir"){
				
				oViewModel.setData({
					titulo: "Inserir Serviço",
					codigoEdit: true
				});
			
				var oNovoServico = {
					"Codigo": "",
					"Descricao": "",
					"Produto": 0,
					"Ativo": false,
					"Empresa" : Session.get("EMPRESA_ID"),
					"Usuario": Session.get("USUARIO_ID"),
					"EmpresaDetails": { __metadata: { uri: "/Empresas(" + Session.get("EMPRESA_ID") + ")"}},
					"UsuarioDetails": { __metadata: { uri: "/Usuarios(" + Session.get("USUARIO_ID") + ")"}}
				};
				
				oJSONModel.setData(oNovoServico);
				
			} else if (this._operacao === "editar"){
				
				oViewModel.setData({
					titulo: "Editar Serviço",
					codigoEdit: false
				});
				
				oModel.read(oParam.sPath,{
					success: function(oData) {
						oJSONModel.setData(oData);
					}
				});
			}
		},
		
		onSalvar: function(){
			if (this._checarCampos(this.getView())) {
				MessageBox.warning("Preencha todos os campos obrigatórios!");
				return;
			}
			
			if (this._operacao === "incluir") {
				this._createServico();
			} else if (this._operacao === "editar") {
				this._updateServico();
			}
		},
		
		_goBack: function(){
			var oRouter = sap.ui.core.UIComponent.getRouterFor(this);
			var oHistory = History.getInstance();
			var sPreviousHash = oHistory.getPreviousHash();
			
			if (sPreviousHash !== undefined) {
					window.history.go(-1);
			} else {
				oRouter.navTo("servicoarmazem", {}, true);
			}
		},
		
		_getDados: function(){
			var oJSONModel = this.getOwnerComponent().getModel("model");
			var oDados = oJSONModel.getData();
			
			oDados.Produto = oDados.Produto ? oDados.Produto : 0;
			
			oDados.ProdutoDetails = {
				__metadata: {
					uri: "/Produtos(" + oDados.Produto + ")"
				}
			};

			return oDados;
		},
		
		_createServico: function() {
			var oModel = this.getOwnerComponent().getModel();
			var that = this;

			oModel.create("/ServicoArmazems", this._getDados(), {
				success: function() {
					MessageBox.success("Serviço inserido com sucesso!", {
						onClose: function(){
							that._goBack(); 
						}
					});
				}
			});
		},
		
		_updateServico: function() {
			var oModel = this.getOwnerComponent().getModel();
			var that = this;
			
			oModel.update(this._sPath, this._getDados(), {
					success: function() {
					MessageBox.success("Serviço alterado com sucesso!", {
						onClose: function(){
							that._goBack();
						}
					});
				}
			});
		},
		
		_checarCampos: function(oView){
			if(oView.byId("codigo").getValue() === "" || oView.byId("descricao").getValue() === ""
			|| oView.byId("produto").getValue() === ""){
				return true;
			} else{
				return false; 
			}
		},
		
		onVoltar: function(){
			this._goBack();
		}
	});

});