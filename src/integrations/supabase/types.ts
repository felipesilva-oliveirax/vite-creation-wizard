export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      agendamentossihl: {
        Row: {
          celular: string | null
          created_at: string
          data: string | null
          id: number
          idagendamento: string | null
          medico: string | null
          paciente: string | null
          status: string | null
          tipo: string | null
        }
        Insert: {
          celular?: string | null
          created_at?: string
          data?: string | null
          id?: number
          idagendamento?: string | null
          medico?: string | null
          paciente?: string | null
          status?: string | null
          tipo?: string | null
        }
        Update: {
          celular?: string | null
          created_at?: string
          data?: string | null
          id?: number
          idagendamento?: string | null
          medico?: string | null
          paciente?: string | null
          status?: string | null
          tipo?: string | null
        }
        Relationships: []
      }
      assinantes: {
        Row: {
          created_at: string
          data_cancelamento: string | null
          data_vencimento: string | null
          grupo_inserido: number | null
          id: number
          integracao: string | null
          nome: string | null
          ordem_id: string | null
          status: string | null
          whatsapp: string | null
        }
        Insert: {
          created_at?: string
          data_cancelamento?: string | null
          data_vencimento?: string | null
          grupo_inserido?: number | null
          id?: number
          integracao?: string | null
          nome?: string | null
          ordem_id?: string | null
          status?: string | null
          whatsapp?: string | null
        }
        Update: {
          created_at?: string
          data_cancelamento?: string | null
          data_vencimento?: string | null
          grupo_inserido?: number | null
          id?: number
          integracao?: string | null
          nome?: string | null
          ordem_id?: string | null
          status?: string | null
          whatsapp?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "assinantes_grupo_inserido_fkey"
            columns: ["grupo_inserido"]
            isOneToOne: false
            referencedRelation: "grupo"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "assinantes_integracao_fkey"
            columns: ["integracao"]
            isOneToOne: false
            referencedRelation: "integracao"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "assinantes_integracao_fkey"
            columns: ["integracao"]
            isOneToOne: false
            referencedRelation: "vw_clube_integracao_assinantes"
            referencedColumns: ["integracao_id"]
          },
        ]
      }
      campanhas: {
        Row: {
          account_id: string
          campaign_id: string
          created_at: string | null
          daily_budget: number
          excluded_titles: string[] | null
          excluded_words: string[] | null
          id: string
          included_words: string[] | null
          keywords: string[]
          name: string
          status: string
          user_id: string | null
        }
        Insert: {
          account_id: string
          campaign_id: string
          created_at?: string | null
          daily_budget: number
          excluded_titles?: string[] | null
          excluded_words?: string[] | null
          id?: string
          included_words?: string[] | null
          keywords: string[]
          name: string
          status?: string
          user_id?: string | null
        }
        Update: {
          account_id?: string
          campaign_id?: string
          created_at?: string | null
          daily_budget?: number
          excluded_titles?: string[] | null
          excluded_words?: string[] | null
          id?: string
          included_words?: string[] | null
          keywords?: string[]
          name?: string
          status?: string
          user_id?: string | null
        }
        Relationships: []
      }
      clube: {
        Row: {
          abertura_grupo: string | null
          companhia_id: number | null
          created_at: string
          descricao: string | null
          entrada: string | null
          fechamento_grupo: string | null
          foto: string | null
          grupo_atual: number | null
          id_clube: number
          nome: string | null
          tipo_pagamento: string | null
        }
        Insert: {
          abertura_grupo?: string | null
          companhia_id?: number | null
          created_at?: string
          descricao?: string | null
          entrada?: string | null
          fechamento_grupo?: string | null
          foto?: string | null
          grupo_atual?: number | null
          id_clube?: number
          nome?: string | null
          tipo_pagamento?: string | null
        }
        Update: {
          abertura_grupo?: string | null
          companhia_id?: number | null
          created_at?: string
          descricao?: string | null
          entrada?: string | null
          fechamento_grupo?: string | null
          foto?: string | null
          grupo_atual?: number | null
          id_clube?: number
          nome?: string | null
          tipo_pagamento?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "grupo_companhia_id_fkey"
            columns: ["companhia_id"]
            isOneToOne: false
            referencedRelation: "companhia"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "grupo_companhia_id_fkey"
            columns: ["companhia_id"]
            isOneToOne: false
            referencedRelation: "view_clube_companhia"
            referencedColumns: ["companhia_id"]
          },
          {
            foreignKeyName: "grupo_companhia_id_fkey"
            columns: ["companhia_id"]
            isOneToOne: false
            referencedRelation: "vw_clubes_fechamento"
            referencedColumns: ["companhia_id"]
          },
          {
            foreignKeyName: "grupo_companhia_id_fkey"
            columns: ["companhia_id"]
            isOneToOne: false
            referencedRelation: "vw_companhia_clube_abertura"
            referencedColumns: ["companhia_id"]
          },
        ]
      }
      companhia: {
        Row: {
          apikey: string | null
          created_at: string
          data_plano: string | null
          host: string | null
          id: number
          instancia: string | null
          nome: string | null
          plano: string | null
          usuario: string | null
        }
        Insert: {
          apikey?: string | null
          created_at?: string
          data_plano?: string | null
          host?: string | null
          id?: number
          instancia?: string | null
          nome?: string | null
          plano?: string | null
          usuario?: string | null
        }
        Update: {
          apikey?: string | null
          created_at?: string
          data_plano?: string | null
          host?: string | null
          id?: number
          instancia?: string | null
          nome?: string | null
          plano?: string | null
          usuario?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "companhia_usuario_fkey"
            columns: ["usuario"]
            isOneToOne: false
            referencedRelation: "usuarios"
            referencedColumns: ["user_id"]
          },
        ]
      }
      grupo: {
        Row: {
          clube: number | null
          created_at: string
          descricao: string | null
          id: number
          link_convite: string | null
          nome: string | null
          qtd_assinantes: number | null
          remojeid: string | null
          status: string | null
        }
        Insert: {
          clube?: number | null
          created_at?: string
          descricao?: string | null
          id?: number
          link_convite?: string | null
          nome?: string | null
          qtd_assinantes?: number | null
          remojeid?: string | null
          status?: string | null
        }
        Update: {
          clube?: number | null
          created_at?: string
          descricao?: string | null
          id?: number
          link_convite?: string | null
          nome?: string | null
          qtd_assinantes?: number | null
          remojeid?: string | null
          status?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "grupo_clube_id_fkey"
            columns: ["clube"]
            isOneToOne: false
            referencedRelation: "clube"
            referencedColumns: ["id_clube"]
          },
          {
            foreignKeyName: "grupo_clube_id_fkey"
            columns: ["clube"]
            isOneToOne: false
            referencedRelation: "view_clube_companhia"
            referencedColumns: ["id_clube"]
          },
          {
            foreignKeyName: "grupo_clube_id_fkey"
            columns: ["clube"]
            isOneToOne: false
            referencedRelation: "view_clube_integracao_assinantes"
            referencedColumns: ["clube_id"]
          },
          {
            foreignKeyName: "grupo_clube_id_fkey"
            columns: ["clube"]
            isOneToOne: false
            referencedRelation: "vw_clube_integracao_assinantes"
            referencedColumns: ["clube_id_clube"]
          },
          {
            foreignKeyName: "grupo_clube_id_fkey"
            columns: ["clube"]
            isOneToOne: false
            referencedRelation: "vw_clubes_fechamento"
            referencedColumns: ["clube_id_clube"]
          },
          {
            foreignKeyName: "grupo_clube_id_fkey"
            columns: ["clube"]
            isOneToOne: false
            referencedRelation: "vw_companhia_clube_abertura"
            referencedColumns: ["id_clube"]
          },
        ]
      }
      integracao: {
        Row: {
          clube_id: number | null
          created_at: string
          id: string
          plataforma: string | null
        }
        Insert: {
          clube_id?: number | null
          created_at?: string
          id?: string
          plataforma?: string | null
        }
        Update: {
          clube_id?: number | null
          created_at?: string
          id?: string
          plataforma?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "integracao_clube_id_fkey"
            columns: ["clube_id"]
            isOneToOne: false
            referencedRelation: "clube"
            referencedColumns: ["id_clube"]
          },
          {
            foreignKeyName: "integracao_clube_id_fkey"
            columns: ["clube_id"]
            isOneToOne: false
            referencedRelation: "view_clube_companhia"
            referencedColumns: ["id_clube"]
          },
          {
            foreignKeyName: "integracao_clube_id_fkey"
            columns: ["clube_id"]
            isOneToOne: false
            referencedRelation: "view_clube_integracao_assinantes"
            referencedColumns: ["clube_id"]
          },
          {
            foreignKeyName: "integracao_clube_id_fkey"
            columns: ["clube_id"]
            isOneToOne: false
            referencedRelation: "vw_clube_integracao_assinantes"
            referencedColumns: ["clube_id_clube"]
          },
          {
            foreignKeyName: "integracao_clube_id_fkey"
            columns: ["clube_id"]
            isOneToOne: false
            referencedRelation: "vw_clubes_fechamento"
            referencedColumns: ["clube_id_clube"]
          },
          {
            foreignKeyName: "integracao_clube_id_fkey"
            columns: ["clube_id"]
            isOneToOne: false
            referencedRelation: "vw_companhia_clube_abertura"
            referencedColumns: ["id_clube"]
          },
        ]
      }
      transacoes: {
        Row: {
          codigoboleto: string | null
          codigocontrato: number | null
          codigofatura: number | null
          created_at: string
          id: number
          nome: string | null
          parcela: number | null
          pdfboleto: string | null
          pix: string | null
          statuscontrato: string | null
          statusfatura: string | null
          telefone: string | null
          valor: number | null
          vencimento: string | null
          whatsapp: string | null
        }
        Insert: {
          codigoboleto?: string | null
          codigocontrato?: number | null
          codigofatura?: number | null
          created_at?: string
          id?: number
          nome?: string | null
          parcela?: number | null
          pdfboleto?: string | null
          pix?: string | null
          statuscontrato?: string | null
          statusfatura?: string | null
          telefone?: string | null
          valor?: number | null
          vencimento?: string | null
          whatsapp?: string | null
        }
        Update: {
          codigoboleto?: string | null
          codigocontrato?: number | null
          codigofatura?: number | null
          created_at?: string
          id?: number
          nome?: string | null
          parcela?: number | null
          pdfboleto?: string | null
          pix?: string | null
          statuscontrato?: string | null
          statusfatura?: string | null
          telefone?: string | null
          valor?: number | null
          vencimento?: string | null
          whatsapp?: string | null
        }
        Relationships: []
      }
      usuarios: {
        Row: {
          companhia_atual: number | null
          created_at: string
          google_ads_refresh_token: string | null
          google_ads_token: string | null
          nome: string | null
          telefone: string | null
          user_id: string
        }
        Insert: {
          companhia_atual?: number | null
          created_at?: string
          google_ads_refresh_token?: string | null
          google_ads_token?: string | null
          nome?: string | null
          telefone?: string | null
          user_id?: string
        }
        Update: {
          companhia_atual?: number | null
          created_at?: string
          google_ads_refresh_token?: string | null
          google_ads_token?: string | null
          nome?: string | null
          telefone?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "usuarios_companhia_atual_fkey"
            columns: ["companhia_atual"]
            isOneToOne: false
            referencedRelation: "companhia"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "usuarios_companhia_atual_fkey"
            columns: ["companhia_atual"]
            isOneToOne: false
            referencedRelation: "view_clube_companhia"
            referencedColumns: ["companhia_id"]
          },
          {
            foreignKeyName: "usuarios_companhia_atual_fkey"
            columns: ["companhia_atual"]
            isOneToOne: false
            referencedRelation: "vw_clubes_fechamento"
            referencedColumns: ["companhia_id"]
          },
          {
            foreignKeyName: "usuarios_companhia_atual_fkey"
            columns: ["companhia_atual"]
            isOneToOne: false
            referencedRelation: "vw_companhia_clube_abertura"
            referencedColumns: ["companhia_id"]
          },
        ]
      }
    }
    Views: {
      transacoes_1_em_aberto: {
        Row: {
          codigoboleto: string | null
          codigocontrato: number | null
          codigofatura: number | null
          created_at: string | null
          id: number | null
          nome: string | null
          parcela: number | null
          pdfboleto: string | null
          pix: string | null
          statuscontrato: string | null
          statusfatura: string | null
          telefone: string | null
          valor: number | null
          vencimento: string | null
          whatsapp: string | null
        }
        Insert: {
          codigoboleto?: string | null
          codigocontrato?: number | null
          codigofatura?: number | null
          created_at?: string | null
          id?: number | null
          nome?: string | null
          parcela?: number | null
          pdfboleto?: string | null
          pix?: string | null
          statuscontrato?: string | null
          statusfatura?: string | null
          telefone?: string | null
          valor?: number | null
          vencimento?: string | null
          whatsapp?: string | null
        }
        Update: {
          codigoboleto?: string | null
          codigocontrato?: number | null
          codigofatura?: number | null
          created_at?: string | null
          id?: number | null
          nome?: string | null
          parcela?: number | null
          pdfboleto?: string | null
          pix?: string | null
          statuscontrato?: string | null
          statusfatura?: string | null
          telefone?: string | null
          valor?: number | null
          vencimento?: string | null
          whatsapp?: string | null
        }
        Relationships: []
      }
      transacoes_1fatura: {
        Row: {
          codigoboleto: string | null
          codigocontrato: number | null
          codigofatura: number | null
          created_at: string | null
          id: number | null
          nome: string | null
          parcela: number | null
          pdfboleto: string | null
          pix: string | null
          statuscontrato: string | null
          statusfatura: string | null
          telefone: string | null
          valor: number | null
          vencimento: string | null
          whatsapp: string | null
        }
        Insert: {
          codigoboleto?: string | null
          codigocontrato?: number | null
          codigofatura?: number | null
          created_at?: string | null
          id?: number | null
          nome?: string | null
          parcela?: number | null
          pdfboleto?: string | null
          pix?: string | null
          statuscontrato?: string | null
          statusfatura?: string | null
          telefone?: string | null
          valor?: number | null
          vencimento?: string | null
          whatsapp?: string | null
        }
        Update: {
          codigoboleto?: string | null
          codigocontrato?: number | null
          codigofatura?: number | null
          created_at?: string | null
          id?: number | null
          nome?: string | null
          parcela?: number | null
          pdfboleto?: string | null
          pix?: string | null
          statuscontrato?: string | null
          statusfatura?: string | null
          telefone?: string | null
          valor?: number | null
          vencimento?: string | null
          whatsapp?: string | null
        }
        Relationships: []
      }
      transacoes_aberto_2_dias: {
        Row: {
          codigoboleto: string | null
          codigocontrato: number | null
          codigofatura: number | null
          created_at: string | null
          id: number | null
          nome: string | null
          parcela: number | null
          pdfboleto: string | null
          pix: string | null
          statuscontrato: string | null
          statusfatura: string | null
          telefone: string | null
          valor: number | null
          vencimento: string | null
          whatsapp: string | null
        }
        Insert: {
          codigoboleto?: string | null
          codigocontrato?: number | null
          codigofatura?: number | null
          created_at?: string | null
          id?: number | null
          nome?: string | null
          parcela?: number | null
          pdfboleto?: string | null
          pix?: string | null
          statuscontrato?: string | null
          statusfatura?: string | null
          telefone?: string | null
          valor?: number | null
          vencimento?: string | null
          whatsapp?: string | null
        }
        Update: {
          codigoboleto?: string | null
          codigocontrato?: number | null
          codigofatura?: number | null
          created_at?: string | null
          id?: number | null
          nome?: string | null
          parcela?: number | null
          pdfboleto?: string | null
          pix?: string | null
          statuscontrato?: string | null
          statusfatura?: string | null
          telefone?: string | null
          valor?: number | null
          vencimento?: string | null
          whatsapp?: string | null
        }
        Relationships: []
      }
      transacoes_pendentes_2faturas: {
        Row: {
          codigoboleto: string | null
          codigocontrato: number | null
          codigofatura: number | null
          created_at: string | null
          id: number | null
          nome: string | null
          parcela: number | null
          pdfboleto: string | null
          pix: string | null
          statuscontrato: string | null
          statusfatura: string | null
          telefone: string | null
          valor: number | null
          vencimento: string | null
          whatsapp: string | null
        }
        Relationships: []
      }
      view_clube_companhia: {
        Row: {
          abertura_grupo: string | null
          apikey: string | null
          clube_created_at: string | null
          companhia_created_at: string | null
          companhia_id: number | null
          companhia_nome: string | null
          data_plano: string | null
          entrada: string | null
          grupo_atual: number | null
          id_clube: number | null
          instancia: string | null
          plano: string | null
          tipo_pagamento: string | null
          usuario: string | null
        }
        Relationships: [
          {
            foreignKeyName: "companhia_usuario_fkey"
            columns: ["usuario"]
            isOneToOne: false
            referencedRelation: "usuarios"
            referencedColumns: ["user_id"]
          },
        ]
      }
      view_clube_integracao_assinantes: {
        Row: {
          assinante_created_at: string | null
          assinante_data_cancelamento: string | null
          assinante_data_vencimento: string | null
          assinante_grupo_inserido: number | null
          assinante_id: number | null
          assinante_integracao: string | null
          assinante_nome: string | null
          assinante_ordem_id: string | null
          assinante_status: string | null
          assinante_whatsapp: string | null
          clube_abertura_grupo: string | null
          clube_companhia_id: number | null
          clube_created_at: string | null
          clube_entrada: string | null
          clube_fechamento_grupo: string | null
          clube_grupo_atual: number | null
          clube_id: number | null
          clube_tipo_pagamento: string | null
          integracao_clube_id: number | null
          integracao_created_at: string | null
          integracao_plataforma: string | null
        }
        Relationships: [
          {
            foreignKeyName: "assinantes_grupo_inserido_fkey"
            columns: ["assinante_grupo_inserido"]
            isOneToOne: false
            referencedRelation: "grupo"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "assinantes_integracao_fkey"
            columns: ["assinante_integracao"]
            isOneToOne: false
            referencedRelation: "integracao"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "assinantes_integracao_fkey"
            columns: ["assinante_integracao"]
            isOneToOne: false
            referencedRelation: "vw_clube_integracao_assinantes"
            referencedColumns: ["integracao_id"]
          },
          {
            foreignKeyName: "grupo_companhia_id_fkey"
            columns: ["clube_companhia_id"]
            isOneToOne: false
            referencedRelation: "companhia"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "grupo_companhia_id_fkey"
            columns: ["clube_companhia_id"]
            isOneToOne: false
            referencedRelation: "view_clube_companhia"
            referencedColumns: ["companhia_id"]
          },
          {
            foreignKeyName: "grupo_companhia_id_fkey"
            columns: ["clube_companhia_id"]
            isOneToOne: false
            referencedRelation: "vw_clubes_fechamento"
            referencedColumns: ["companhia_id"]
          },
          {
            foreignKeyName: "grupo_companhia_id_fkey"
            columns: ["clube_companhia_id"]
            isOneToOne: false
            referencedRelation: "vw_companhia_clube_abertura"
            referencedColumns: ["companhia_id"]
          },
          {
            foreignKeyName: "integracao_clube_id_fkey"
            columns: ["integracao_clube_id"]
            isOneToOne: false
            referencedRelation: "clube"
            referencedColumns: ["id_clube"]
          },
          {
            foreignKeyName: "integracao_clube_id_fkey"
            columns: ["integracao_clube_id"]
            isOneToOne: false
            referencedRelation: "view_clube_companhia"
            referencedColumns: ["id_clube"]
          },
          {
            foreignKeyName: "integracao_clube_id_fkey"
            columns: ["integracao_clube_id"]
            isOneToOne: false
            referencedRelation: "view_clube_integracao_assinantes"
            referencedColumns: ["clube_id"]
          },
          {
            foreignKeyName: "integracao_clube_id_fkey"
            columns: ["integracao_clube_id"]
            isOneToOne: false
            referencedRelation: "vw_clube_integracao_assinantes"
            referencedColumns: ["clube_id_clube"]
          },
          {
            foreignKeyName: "integracao_clube_id_fkey"
            columns: ["integracao_clube_id"]
            isOneToOne: false
            referencedRelation: "vw_clubes_fechamento"
            referencedColumns: ["clube_id_clube"]
          },
          {
            foreignKeyName: "integracao_clube_id_fkey"
            columns: ["integracao_clube_id"]
            isOneToOne: false
            referencedRelation: "vw_companhia_clube_abertura"
            referencedColumns: ["id_clube"]
          },
        ]
      }
      view_tres_dias_sihl: {
        Row: {
          celular: string | null
          created_at: string | null
          data: string | null
          id: number | null
          idagendamento: string | null
          medico: string | null
          paciente: string | null
          status: string | null
          tipo: string | null
        }
        Insert: {
          celular?: string | null
          created_at?: string | null
          data?: string | null
          id?: number | null
          idagendamento?: string | null
          medico?: string | null
          paciente?: string | null
          status?: string | null
          tipo?: string | null
        }
        Update: {
          celular?: string | null
          created_at?: string | null
          data?: string | null
          id?: number | null
          idagendamento?: string | null
          medico?: string | null
          paciente?: string | null
          status?: string | null
          tipo?: string | null
        }
        Relationships: []
      }
      vw_clube_integracao_assinantes: {
        Row: {
          assinantes_created_at: string | null
          assinantes_data_cancelamento: string | null
          assinantes_data_vencimento: string | null
          assinantes_grupo_inserido: number | null
          assinantes_id: number | null
          assinantes_integracao: string | null
          assinantes_nome: string | null
          assinantes_ordem_id: string | null
          assinantes_status: string | null
          assinantes_whatsapp: string | null
          clube_abertura_grupo: string | null
          clube_companhia_id: number | null
          clube_created_at: string | null
          clube_entrada: string | null
          clube_fechamento_grupo: string | null
          clube_grupo_atual: number | null
          clube_id_clube: number | null
          clube_tipo_pagamento: string | null
          integracao_clube_id: number | null
          integracao_created_at: string | null
          integracao_id: string | null
          integracao_plataforma: string | null
        }
        Relationships: [
          {
            foreignKeyName: "assinantes_grupo_inserido_fkey"
            columns: ["assinantes_grupo_inserido"]
            isOneToOne: false
            referencedRelation: "grupo"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "assinantes_integracao_fkey"
            columns: ["assinantes_integracao"]
            isOneToOne: false
            referencedRelation: "integracao"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "assinantes_integracao_fkey"
            columns: ["assinantes_integracao"]
            isOneToOne: false
            referencedRelation: "vw_clube_integracao_assinantes"
            referencedColumns: ["integracao_id"]
          },
          {
            foreignKeyName: "grupo_companhia_id_fkey"
            columns: ["clube_companhia_id"]
            isOneToOne: false
            referencedRelation: "companhia"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "grupo_companhia_id_fkey"
            columns: ["clube_companhia_id"]
            isOneToOne: false
            referencedRelation: "view_clube_companhia"
            referencedColumns: ["companhia_id"]
          },
          {
            foreignKeyName: "grupo_companhia_id_fkey"
            columns: ["clube_companhia_id"]
            isOneToOne: false
            referencedRelation: "vw_clubes_fechamento"
            referencedColumns: ["companhia_id"]
          },
          {
            foreignKeyName: "grupo_companhia_id_fkey"
            columns: ["clube_companhia_id"]
            isOneToOne: false
            referencedRelation: "vw_companhia_clube_abertura"
            referencedColumns: ["companhia_id"]
          },
          {
            foreignKeyName: "integracao_clube_id_fkey"
            columns: ["integracao_clube_id"]
            isOneToOne: false
            referencedRelation: "clube"
            referencedColumns: ["id_clube"]
          },
          {
            foreignKeyName: "integracao_clube_id_fkey"
            columns: ["integracao_clube_id"]
            isOneToOne: false
            referencedRelation: "view_clube_companhia"
            referencedColumns: ["id_clube"]
          },
          {
            foreignKeyName: "integracao_clube_id_fkey"
            columns: ["integracao_clube_id"]
            isOneToOne: false
            referencedRelation: "view_clube_integracao_assinantes"
            referencedColumns: ["clube_id"]
          },
          {
            foreignKeyName: "integracao_clube_id_fkey"
            columns: ["integracao_clube_id"]
            isOneToOne: false
            referencedRelation: "vw_clube_integracao_assinantes"
            referencedColumns: ["clube_id_clube"]
          },
          {
            foreignKeyName: "integracao_clube_id_fkey"
            columns: ["integracao_clube_id"]
            isOneToOne: false
            referencedRelation: "vw_clubes_fechamento"
            referencedColumns: ["clube_id_clube"]
          },
          {
            foreignKeyName: "integracao_clube_id_fkey"
            columns: ["integracao_clube_id"]
            isOneToOne: false
            referencedRelation: "vw_companhia_clube_abertura"
            referencedColumns: ["id_clube"]
          },
        ]
      }
      vw_clubes_fechamento: {
        Row: {
          clube_abertura_grupo: string | null
          clube_companhia_id: number | null
          clube_created_at: string | null
          clube_entrada: string | null
          clube_fechamento_grupo: string | null
          clube_grupo_atual: number | null
          clube_id_clube: number | null
          clube_tipo_pagamento: string | null
          companhia_apikey: string | null
          companhia_created_at: string | null
          companhia_data_plano: string | null
          companhia_id: number | null
          companhia_instancia: string | null
          companhia_nome: string | null
          companhia_plano: string | null
          companhia_usuario: string | null
        }
        Relationships: [
          {
            foreignKeyName: "companhia_usuario_fkey"
            columns: ["companhia_usuario"]
            isOneToOne: false
            referencedRelation: "usuarios"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "grupo_companhia_id_fkey"
            columns: ["clube_companhia_id"]
            isOneToOne: false
            referencedRelation: "companhia"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "grupo_companhia_id_fkey"
            columns: ["clube_companhia_id"]
            isOneToOne: false
            referencedRelation: "view_clube_companhia"
            referencedColumns: ["companhia_id"]
          },
          {
            foreignKeyName: "grupo_companhia_id_fkey"
            columns: ["clube_companhia_id"]
            isOneToOne: false
            referencedRelation: "vw_clubes_fechamento"
            referencedColumns: ["companhia_id"]
          },
          {
            foreignKeyName: "grupo_companhia_id_fkey"
            columns: ["clube_companhia_id"]
            isOneToOne: false
            referencedRelation: "vw_companhia_clube_abertura"
            referencedColumns: ["companhia_id"]
          },
        ]
      }
      vw_companhia_clube_abertura: {
        Row: {
          abertura_grupo: string | null
          clube_created_at: string | null
          companhia_apikey: string | null
          companhia_created_at: string | null
          companhia_data_plano: string | null
          companhia_id: number | null
          companhia_instancia: string | null
          companhia_nome: string | null
          companhia_plano: string | null
          companhia_usuario: string | null
          descricao: string | null
          entrada: string | null
          fechamento_grupo: string | null
          foto: string | null
          grupo_atual: number | null
          id_clube: number | null
          nome: string | null
          tipo_pagamento: string | null
        }
        Relationships: [
          {
            foreignKeyName: "companhia_usuario_fkey"
            columns: ["companhia_usuario"]
            isOneToOne: false
            referencedRelation: "usuarios"
            referencedColumns: ["user_id"]
          },
        ]
      }
    }
    Functions: {
      get_instancia_apikey: {
        Args: {
          comp_id: number
        }
        Returns: string
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type PublicSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  PublicTableNameOrOptions extends
    | keyof (PublicSchema["Tables"] & PublicSchema["Views"])
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
        Database[PublicTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
      Database[PublicTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : PublicTableNameOrOptions extends keyof (PublicSchema["Tables"] &
        PublicSchema["Views"])
    ? (PublicSchema["Tables"] &
        PublicSchema["Views"])[PublicTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  PublicEnumNameOrOptions extends
    | keyof PublicSchema["Enums"]
    | { schema: keyof Database },
  EnumName extends PublicEnumNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = PublicEnumNameOrOptions extends { schema: keyof Database }
  ? Database[PublicEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : PublicEnumNameOrOptions extends keyof PublicSchema["Enums"]
    ? PublicSchema["Enums"][PublicEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof PublicSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof PublicSchema["CompositeTypes"]
    ? PublicSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never
