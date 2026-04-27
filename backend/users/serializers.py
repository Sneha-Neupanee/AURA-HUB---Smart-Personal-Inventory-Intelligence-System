from django.contrib.auth.password_validation import validate_password
from rest_framework import serializers
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer

from .models import User


class RegisterSerializer(serializers.ModelSerializer):
    """Handles new user registration with password confirmation."""
    password = serializers.CharField(
        write_only=True, required=True, validators=[validate_password]
    )
    password2 = serializers.CharField(write_only=True, required=True)

    class Meta:
        model = User
        fields = ["id", "username", "email", "password", "password2"]
        extra_kwargs = {"id": {"read_only": True}}

    def validate(self, attrs):
        if attrs["password"] != attrs["password2"]:
            raise serializers.ValidationError({"password": "Passwords do not match."})
        return attrs

    def create(self, validated_data):
        validated_data.pop("password2")
        user = User.objects.create_user(**validated_data)
        return user


class UserProfileSerializer(serializers.ModelSerializer):
    """Read / partial-update profile."""

    class Meta:
        model = User
        fields = ["id", "username", "email", "role", "created_at", "updated_at"]
        read_only_fields = ["id", "role", "email", "created_at", "updated_at"]


class CustomTokenObtainPairSerializer(TokenObtainPairSerializer):
    """Inject user data into token response."""

    def validate(self, attrs):
        data = super().validate(attrs)
        data["user"] = UserProfileSerializer(self.user).data
        return data
