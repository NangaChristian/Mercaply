const fs = require('fs');
let content = fs.readFileSync('src/pages/admin/AdminDashboardPage.tsx', 'utf-8');

const oldFetch = `
    async function fetchStats() {
      try {
        const usersSnap = await getDocs(collection(db, 'users'));
        const storesSnap = await getDocs(collection(db, 'stores'));
        const productsSnap = await getDocs(collection(db, 'products'));
        const ordersSnap = await getDocs(collection(db, 'orders'));
        
        const usersCount = usersSnap.size;
        const storesCount = storesSnap.size;
        const productsCount = productsSnap.size;
        const ordersCount = ordersSnap.size;
`.trim();

const newFetch = `
    async function fetchStats() {
      try {
        const { count: usersCount } = await supabase.from('profiles').select('*', { count: 'exact', head: true });
        const { count: storesCount } = await supabase.from('stores').select('*', { count: 'exact', head: true });
        const { count: productsCount } = await supabase.from('products').select('*', { count: 'exact', head: true });
        const { count: ordersCount } = await supabase.from('orders').select('*', { count: 'exact', head: true });
`.trim();

content = content.replace(oldFetch, newFetch);

// Also we need to fetch orders for revenue and products for categories, and users for user growth.
const oldCalc = `
        let totalRevenue = 0;
        const salesByMonth: Record<string, number> = {
          'Jan': 0, 'Fév': 0, 'Mar': 0, 'Avr': 0, 'Mai': 0, 'Juin': 0, 'Juil': 0, 'Août': 0, 'Sep': 0, 'Oct': 0, 'Nov': 0, 'Déc': 0
        };
        const usersByMonth: Record<string, number> = {
          'Jan': 0, 'Fév': 0, 'Mar': 0, 'Avr': 0, 'Mai': 0, 'Juin': 0, 'Juil': 0, 'Août': 0, 'Sep': 0, 'Oct': 0, 'Nov': 0, 'Déc': 0
        };
        const catCounts: Record<string, number> = {};

        ordersSnap.forEach((doc: any) => {
          const data = doc.data();
          if (data.status === 'delivered' || data.status === 'shipped' || data.status === 'processing') {
            totalRevenue += (data.total_amount || 0);
            
            const date = data.created_at?.toDate ? data.created_at.toDate() : new Date(data.created_at || Date.now());
            const monthNames = ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Juin', 'Juil', 'Août', 'Sep', 'Oct', 'Nov', 'Déc'];
            const month = monthNames[date.getMonth()];
            salesByMonth[month] = (salesByMonth[month] || 0) + (data.total_amount || 0);
          }
        });

        usersSnap.forEach((doc: any) => {
          const data = doc.data();
          const date = data.created_at?.toDate ? data.created_at.toDate() : new Date(data.created_at || Date.now());
          const monthNames = ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Juin', 'Juil', 'Août', 'Sep', 'Oct', 'Nov', 'Déc'];
          const month = monthNames[date.getMonth()];
          usersByMonth[month] = (usersByMonth[month] || 0) + 1;
        });

        productsSnap.forEach((doc: any) => {
          const data = doc.data();
          const cat = data.category || 'Non catégorisé';
          catCounts[cat] = (catCounts[cat] || 0) + 1;
        });
`.trim();

const newCalc = `
        let totalRevenue = 0;
        const salesByMonth: Record<string, number> = {
          'Jan': 0, 'Fév': 0, 'Mar': 0, 'Avr': 0, 'Mai': 0, 'Juin': 0, 'Juil': 0, 'Août': 0, 'Sep': 0, 'Oct': 0, 'Nov': 0, 'Déc': 0
        };
        const usersByMonth: Record<string, number> = {
          'Jan': 0, 'Fév': 0, 'Mar': 0, 'Avr': 0, 'Mai': 0, 'Juin': 0, 'Juil': 0, 'Août': 0, 'Sep': 0, 'Oct': 0, 'Nov': 0, 'Déc': 0
        };
        const catCounts: Record<string, number> = {};

        const { data: ordersData } = await supabase.from('orders').select('*');
        if (ordersData) {
          ordersData.forEach((data: any) => {
            if (data.status === 'delivered' || data.status === 'shipped' || data.status === 'processing') {
              totalRevenue += (data.total_amount || 0);
              
              const date = new Date(data.created_at || Date.now());
              const monthNames = ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Juin', 'Juil', 'Août', 'Sep', 'Oct', 'Nov', 'Déc'];
              const month = monthNames[date.getMonth()];
              salesByMonth[month] = (salesByMonth[month] || 0) + (data.total_amount || 0);
            }
          });
        }

        const { data: usersData } = await supabase.from('profiles').select('*');
        if (usersData) {
          usersData.forEach((data: any) => {
            const date = new Date(data.created_at || Date.now());
            const monthNames = ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Juin', 'Juil', 'Août', 'Sep', 'Oct', 'Nov', 'Déc'];
            const month = monthNames[date.getMonth()];
            usersByMonth[month] = (usersByMonth[month] || 0) + 1;
          });
        }

        const { data: productsData } = await supabase.from('products').select('category');
        if (productsData) {
          productsData.forEach((data: any) => {
            const cat = data.category || 'Non catégorisé';
            catCounts[cat] = (catCounts[cat] || 0) + 1;
          });
        }
`.trim();

content = content.replace(oldCalc, newCalc);

// We need to add supabase import if missing
if (!content.includes("import { supabase }")) {
  content = content.replace("import { useEffect, useState } from 'react';", "import { useEffect, useState } from 'react';\nimport { supabase } from '../../lib/supabase';");
}

fs.writeFileSync('src/pages/admin/AdminDashboardPage.tsx', content, 'utf-8');
