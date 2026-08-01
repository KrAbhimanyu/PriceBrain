package com.pricebrain.shared.events;

import lombok.*;
import lombok.experimental.SuperBuilder;

import java.util.UUID;

/**
 * User-related domain events.
 */
public class UserEvents {

    private UserEvents() {}

    @Data
    @SuperBuilder
    @EqualsAndHashCode(callSuper = true)
    public static class UserCreated extends DomainEvent {
        private String email;
        private String firstName;
        private String lastName;
        private String role;
        private String language;
        private String currency;

        @Override
        public String getTopic() {
            return "user.created";
        }

        @Override
        public String getEventType() {
            return "USER_CREATED";
        }

        @Override
        public String getAggregateType() {
            return "USER";
        }
    }

    @Data
    @SuperBuilder
    @EqualsAndHashCode(callSuper = true)
    public static class UserUpdated extends DomainEvent {
        private String email;
        private String firstName;
        private String lastName;
        private String phone;
        private String profileImageUrl;

        @Override
        public String getTopic() {
            return "user.updated";
        }

        @Override
        public String getEventType() {
            return "USER_UPDATED";
        }

        @Override
        public String getAggregateType() {
            return "USER";
        }
    }

    @Data
    @SuperBuilder
    @EqualsAndHashCode(callSuper = true)
    public static class UserEmailVerified extends DomainEvent {
        private String email;

        @Override
        public String getTopic() {
            return "user.email-verified";
        }

        @Override
        public String getEventType() {
            return "USER_EMAIL_VERIFIED";
        }

        @Override
        public String getAggregateType() {
            return "USER";
        }
    }

    @Data
    @SuperBuilder
    @EqualsAndHashCode(callSuper = true)
    public static class UserPasswordChanged extends DomainEvent {
        private String email;
        private boolean byAdmin;

        @Override
        public String getTopic() {
            return "user.password-changed";
        }

        @Override
        public String getEventType() {
            return "USER_PASSWORD_CHANGED";
        }

        @Override
        public String getAggregateType() {
            return "USER";
        }
    }

    @Data
    @SuperBuilder
    @EqualsAndHashCode(callSuper = true)
    public static class UserLogin extends DomainEvent {
        private String email;
        private String ipAddress;
        private String userAgent;
        private boolean successful;

        @Override
        public String getTopic() {
            return successful ? "user.login.success" : "user.login.failed";
        }

        @Override
        public String getEventType() {
            return successful ? "USER_LOGIN_SUCCESS" : "USER_LOGIN_FAILED";
        }

        @Override
        public String getAggregateType() {
            return "USER";
        }
    }

    @Data
    @SuperBuilder
    @EqualsAndHashCode(callSuper = true)
    public static class UserLogout extends DomainEvent {
        private String email;

        @Override
        public String getTopic() {
            return "user.logout";
        }

        @Override
        public String getEventType() {
            return "USER_LOGOUT";
        }

        @Override
        public String getAggregateType() {
            return "USER";
        }
    }
}
