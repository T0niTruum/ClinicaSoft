import { DashboardService } from '../services/dashboardService.js';

export const getDashboard = async (req, res) => {
  const dashboard = await DashboardService.getDashboardData();

  return res.respond({
    success: true,
    message: 'Resumen principal cargado',
    data: dashboard,
    view: 'dashboard',
    locals: {
      dashboard,
    },
  });
};