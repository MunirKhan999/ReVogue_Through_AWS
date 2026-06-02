import { All, Controller, Get, Module, Req, Res } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { Request, Response } from 'express';
import * as http from 'http';

const routes: Record<string, { host: string; port: number }> = {
  catalog: { host: process.env.CATALOG_HOST || 'catalog.commerce.local', port: 3001 },
  cart: { host: process.env.CART_HOST || 'cart.commerce.local', port: 3002 },
  order: { host: process.env.ORDER_HOST || 'order.commerce.local', port: 3003 },
  payment: { host: process.env.PAYMENT_HOST || 'payment.commerce.local', port: 3004 },
  notification: { host: process.env.NOTIFICATION_HOST || 'notification.commerce.local', port: 3005 },
};

function proxyTo(host: string, port: number, path: string, req: Request, res: Response) {
  const options: http.RequestOptions = {
    hostname: host,
    port,
    path,
    method: req.method,
    headers: { ...req.headers, host: `${host}:${port}` },
  };
  const proxyReq = http.request(options, (proxyRes) => {
    res.writeHead(proxyRes.statusCode || 502, proxyRes.headers);
    proxyRes.pipe(res);
  });
  proxyReq.on('error', () => res.status(502).json({ message: 'upstream unavailable' }));
  req.pipe(proxyReq);
}

@Controller()
class GatewayController {
  @Get('health')
  health() {
    return { status: 'ok', service: 'gateway' };
  }

  @All('api/:service/*')
  proxy(@Req() req: Request, @Res() res: Response) {
    const service = req.params.service;
    if (!routes[service]) {
      return res.status(404).json({ message: `Unknown service: ${service}` });
    }
    const original = (req as any).originalUrl || req.url || '';
    const forwardPath = original.replace(new RegExp(`^/api/${service}`), '') || '/';
    proxyTo(routes[service].host, routes[service].port, forwardPath, req, res);
  }
}

@Module({ controllers: [GatewayController] })
class AppModule {}

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  await app.listen(parseInt(process.env.PORT || '8080', 10), '0.0.0.0');
}

bootstrap();
