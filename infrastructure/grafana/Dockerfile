FROM grafana/grafana:10.2.0

# Install plugins
RUN grafana-cli plugins install grafana-piechart-panel
RUN grafana-cli plugins install grafana-clock-panel

# Copy provisioning
COPY provisioning/ /etc/grafana/provisioning/

# Copy dashboards
COPY dashboards/ /var/lib/grafana/dashboards/

# Set permissions
RUN chmod -R 755 /etc/grafana/provisioning/ /var/lib/grafana/dashboards/

EXPOSE 3000

VOLUME ["/var/lib/grafana"]

ENTRYPOINT ["/run.sh"]
