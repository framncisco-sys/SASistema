from rest_framework import serializers
from .models import Cliente, Compra, Venta, Retencion # <--- ¡AQUÍ FALTABA Venta!

class ClienteSerializer(serializers.ModelSerializer):
    class Meta:
        model = Cliente
        fields = '__all__'

class CompraSerializer(serializers.ModelSerializer):
    class Meta:
        model = Compra
        fields = '__all__'

class VentaSerializer(serializers.ModelSerializer):
    class Meta:
        model = Venta
        fields = '__all__'

class RetencionSerializer(serializers.ModelSerializer):
    class Meta:
        model = Retencion
        fields = '__all__'
