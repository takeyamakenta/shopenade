#!/bin/sh
TRAEFIK_IP=$(getent hosts traefik | awk '{print $1}')
FQDN='c044so4g8gsccg0kwsk0808o.163.44.123.34.sslip.io'
grep -q "$FQDN" /etc/hosts || echo "$TRAEFIK_IP $FQDN" >> /etc/hosts
exec "$@"
