export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      products: {
        Row: {
          id: string
          name: string
          description: string
          purchase_price: number
          selling_price: number
          stock: number
          image_url: string
          category: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          description: string
          purchase_price: number
          selling_price: number
          stock: number
          image_url: string
          category: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          description?: string
          purchase_price?: number
          selling_price?: number
          stock?: number
          image_url?: string
          category?: string
          created_at?: string
          updated_at?: string
        }
      }
      partners: {
        Row: {
          id: string
          name: string
          contact: string
          email: string
          phone: string
          address: string
          notes: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          contact: string
          email: string
          phone: string
          address: string
          notes: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          contact?: string
          email?: string
          phone?: string
          address?: string
          notes?: string
          created_at?: string
          updated_at?: string
        }
      }
      invoices: {
        Row: {
          id: string
          partner_id: string
          partner_name: string
          date: string
          subtotal: number
          tax: number
          total: number
          status: string
          notes: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          partner_id: string
          partner_name: string
          date: string
          subtotal: number
          tax: number
          total: number
          status: string
          notes: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          partner_id?: string
          partner_name?: string
          date?: string
          subtotal?: number
          tax?: number
          total?: number
          status?: string
          notes?: string
          created_at?: string
          updated_at?: string
        }
      }
      invoice_items: {
        Row: {
          id: string
          invoice_id: string
          product_id: string
          product_name: string
          quantity: number
          unit_price: number
          total: number
          created_at: string
        }
        Insert: {
          id?: string
          invoice_id: string
          product_id: string
          product_name: string
          quantity: number
          unit_price: number
          total: number
          created_at?: string
        }
        Update: {
          id?: string
          invoice_id?: string
          product_id?: string
          product_name?: string
          quantity?: number
          unit_price?: number
          total?: number
          created_at?: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
  }
}
