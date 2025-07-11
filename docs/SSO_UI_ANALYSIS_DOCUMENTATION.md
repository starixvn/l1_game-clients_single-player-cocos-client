# SSO Direct-to-Game UI Analysis Documentation

## Overview

This document provides a comprehensive analysis of the required UI components and metadata for Single Sign-On (SSO) direct-to-game functionality in the Cocos Creator client. The analysis is based on the examination of prefab files, scene structures, and the SSO workflow documentation.

## Table of Contents

1. [UI Architecture Overview](#ui-architecture-overview)
2. [Splash Scene UI Components](#splash-scene-ui-components)
3. [Microsite Game Webview](#microsite-game-webview)
4. [Lobby Scene Integration](#lobby-scene-integration)
5. [Mini Games Panel](#mini-games-panel)
6. [SSO Authentication Flow UI](#sso-authentication-flow-ui)
7. [Game Launch Decision UI](#game-launch-decision-ui)
8. [Session Management UI](#session-management-ui)
9. [Responsive Design Requirements](#responsive-design-requirements)
10. [Implementation Guidelines](#implementation-guidelines)
11. [Error Handling UI](#error-handling-ui)
12. [Performance Considerations](#performance-considerations)

---

## UI Architecture Overview

```mermaid
graph TB
    subgraph "SSO Direct-to-Game UI Architecture"
        A[Splash Scene] --> B{Authentication Check}
        B -->|Success| C[Game Launch Decision]
        B -->|Failure| D[Error Handling UI]

        C -->|Direct Game| E[Load Game Directly]
        C -->|Microsite Game| F[Microsite Container]
        C -->|Gateway Game| G[Socket Gateway]
        C -->|Default| H[Lobby Scene]

        F --> I[Iframe Webview]
        E --> J[Game Scene]
        G --> K[Gateway Lobby]
        H --> L[Main Lobby UI]

        subgraph "UI Components"
            M[Loading Progress]
            N[Branding Elements]
            O[Status Messages]
            P[Error Dialogs]
            Q[Session Management]
        end
    end

    style A fill:#e3f2fd
    style F fill:#fff3e0
    style D fill:#ffebee
    style M fill:#e8f5e8
    style N fill:#f3e5f5
```

### UI Component Hierarchy

```
Root Canvas (1398x786)
├── Background Layer
│   └── Full-screen background (Black)
├── Main Splash Layer
│   ├── Loading Progress UI
│   ├── Branding Elements
│   └── Status Messages
├── Microsite Game Layer
│   └── Iframe Container (Hidden by default)
├── Dialog Layer
│   └── Error & Notification Dialogs
└── Overlay Layer
    └── Session Management UI
```

---

## Splash Scene UI Components

### Scene Structure Analysis

```mermaid
graph LR
    subgraph "Splash.fire Scene Structure"
        A[Canvas Node] --> B[Main Camera]
        A --> C[Background Node]
        A --> D[Splash Container]
        A --> E[Microsite Game Node]

        D --> F[Loading Progress]
        D --> G[Branding Elements]
        D --> H[Status Messages]
        D --> I[Notice Container]

        E --> J[Webview Prefab]

        subgraph "Branding Variants"
            K[Saba Play]
            L[Other VG]
            M[Other SG]
            N[Tip88]
        end

        G --> K
        G --> L
        G --> M
        G --> N
    end

    style A fill:#e3f2fd
    style E fill:#fff3e0
    style F fill:#e8f5e8
    style G fill:#f3e5f5
```

### Key UI Components

#### 1. **Loading Progress Elements**

```typescript
interface LoadingProgressUI {
    containerProgressBar: cc.Node; // Progress bar container
    percentResourceLoad: cc.Label; // Loading percentage text
    messageComp: RandomWaitingMessage; // Status message component
}
```

#### 2. **Branding Elements**

```typescript
interface BrandingUI {
    sloganSC1: cc.Node; // Saba Play variant 1
    sloganSC2: cc.Node; // Saba Play variant 2
    sloganSabaPlay: cc.Node; // Main Saba Play branding
    sloganOtherVG: cc.Node; // Other VG operator
    sloganOtherSG: cc.Node; // Other SG operator
    sloganTip88: cc.Node; // Tip88 operator
    iconTop: cc.Sprite; // Top operator icon
    iconBottom: cc.Sprite; // Bottom operator icon
}
```

#### 3. **Microsite Game Container**

```typescript
interface MicrositeContainerUI {
    nodeMicrositeGame: cc.Node; // Full-screen container
    prfMicrositeGame: cc.Prefab; // Webview prefab reference
    webview: CustomWebView; // Iframe component
}
```

### Scene Metadata

| Component        | Type      | Size        | Position | Properties        |
| ---------------- | --------- | ----------- | -------- | ----------------- |
| Canvas           | cc.Node   | 1398x786    | Center   | Design resolution |
| Background       | cc.Sprite | 1398x786    | (0,0)    | Black color       |
| Splash Container | cc.Node   | Full-screen | Center   | Widget layout     |
| Microsite Node   | cc.Node   | 1398x786    | Center   | Hidden by default |

---

## Microsite Game Webview

### Prefab Structure

```mermaid
graph TB
    subgraph "MicrositeGameWebview.prefab"
        A[microsite-game-webview] --> B[webview]
        B --> C[CustomWebView Component]
        B --> D[Widget Component]

        C --> E[Iframe Implementation]
        C --> F[PostMessage Handler]
        C --> G[URL Management]

        subgraph "Webview Features"
            H[Full-screen iframe]
            I[Responsive layout]
            J[Event communication]
            K[Session sync]
        end
    end

    style A fill:#fff3e0
    style E fill:#e8f5e8
    style J fill:#f3e5f5
```

### Component Properties

```typescript
interface MicrositeWebviewUI {
    // Root container
    rootNode: {
        size: { width: 1398; height: 786 };
        anchorPoint: { x: 0.5; y: 0.5 };
        position: { x: 699; y: 393 };
    };

    // Webview component
    webview: {
        url: string;
        webviewEvents: string[];
        iframeId: "microsite";
    };

    // Widget layout
    widget: {
        alignMode: 1;
        alignFlags: 45;
        fullStretch: true;
    };
}
```

### Iframe Integration

```mermaid
sequenceDiagram
    participant Splash as Splash Scene
    participant Webview as Microsite Webview
    participant Iframe as Game Iframe
    participant Auth as Auth Manager

    Splash->>Webview: Enable microsite game
    Webview->>Webview: Create iframe container
    Webview->>Iframe: Load game URL with SSO params
    Iframe->>Auth: Validate session
    Auth-->>Iframe: Session data
    Iframe->>Webview: PostMessage: ready
    Webview->>Splash: Game loaded successfully
```

---

## Lobby Scene Integration

### Lobby UI Structure

```mermaid
graph LR
    subgraph "Lobby.fire Scene"
        A[Canvas] --> B[Main Camera]
        A --> C[Background]
        A --> D[UI Layers]
        A --> E[Game Grid]
        A --> F[Navigation]

        D --> G[Content Layer]
        D --> H[Overlay Layer]

        E --> I[Game Icons]
        E --> J[Category Filters]

        F --> K[Menu]
        F --> L[Settings]
        F --> M[User Profile]
    end

    style A fill:#e3f2fd
    style E fill:#e8f5e8
    style F fill:#f3e5f5
```

### SSO Integration Points

```typescript
interface LobbySSOIntegration {
  // SSO game launch handling
  onSignIn(): void {
    if (isSSOToGame) {
      loadLobby(false);
      openGameSSO();
    }
  };

  // Direct mode support
  handleDirectMode(): void {
    if (isDirectMode) {
      backToOperatorLobby();
    }
  };
}
```

---

## Mini Games Panel

### Panel Structure

```mermaid
graph TB
    subgraph "MiniPanel.prefab"
        A[MiniPanel Root] --> B[MiniGames Container]
        A --> C[Column Prefabs]
        A --> D[UI Components]

        B --> E[Game Grid Layout]
        B --> F[Responsive Design]

        C --> G[Reusable Columns]
        C --> H[Game Icons]

        D --> I[Loading States]
        D --> J[Navigation]
    end

    style A fill:#e8f5e8
    style B fill:#f3e5f5
    style C fill:#fff3e0
```

### Component Properties

| Component           | Size         | Layout      | Features          |
| ------------------- | ------------ | ----------- | ----------------- |
| MiniPanel Root      | 1398x786     | Full-screen | Responsive widget |
| MiniGames Container | Full-stretch | Grid layout | Game icon display |
| Column Prefabs      | Dynamic      | Reusable    | Modular design    |

---

## SSO Authentication Flow UI

### Authentication UI States

```mermaid
stateDiagram-v2
    [*] --> Loading
    Loading --> Authenticating: Token Present
    Loading --> SessionCheck: No Token

    Authenticating --> Success: Auth Success
    Authenticating --> Failure: Auth Failed
    Authenticating --> Error: Network Error

    SessionCheck --> ValidSession: Session Valid
    SessionCheck --> InvalidSession: Session Expired

    Success --> GameLaunch
    ValidSession --> GameLaunch
    Failure --> ErrorDialog
    Error --> ErrorDialog
    InvalidSession --> ReauthPrompt

    ErrorDialog --> Retry: User Retry
    ReauthPrompt --> Authenticating: Reauth

    GameLaunch --> [*]
    Retry --> Authenticating
```

### UI Components for Each State

#### **Loading State**

```typescript
interface LoadingStateUI {
    progressBar: cc.Node;
    percentageLabel: cc.Label;
    loadingMessage: cc.Label;
    brandingElements: cc.Node[];
    spinner: cc.Node;
}
```

#### **Authenticating State**

```typescript
interface AuthenticatingStateUI {
    statusMessage: cc.Label;
    progressIndicator: cc.Node;
    cancelButton: cc.Button;
    timeoutWarning: cc.Node;
}
```

#### **Error State**

```typescript
interface ErrorStateUI {
    errorDialog: cc.Node;
    errorMessage: cc.Label;
    retryButton: cc.Button;
    helpLink: cc.Label;
    closeButton: cc.Button;
}
```

---

## Game Launch Decision UI

### Launch Decision Flow

```mermaid
graph TD
    A[Handle Splash Scene] --> B{Check URL Params}

    B -->|Has 'params'| C[Standalone Micro-site]
    B -->|Has 'token' + 'gameId'| D[SSO Game Launch]
    B -->|Has micrositeGameId| E[Reload Micro-site]
    B -->|None of above| F[Default: Lobby/Direct]

    C --> G{Is Gateway Game?}
    G -->|Yes| H[Open Socket Gateway]
    G -->|No| I[Load to Lobby/Direct]

    D --> J{Is Gateway Game?}
    J -->|Yes| H
    J -->|No| K{Is Micro-site Game?}
    K -->|Yes| L[Enable Micro-site Iframe]
    K -->|No| M{Check Dummy Room}
    M -->|Has Dummy Room| N[Load Dummy Room]
    M -->|No Dummy Room| I

    E --> L
    F --> I

    style A fill:#e3f2fd
    style L fill:#fff3e0
    style H fill:#e8f5e8
    style N fill:#fce4ec
```

### UI Components for Each Launch Type

#### **Direct Game Launch**

```typescript
interface DirectGameLaunchUI {
    gameLoader: cc.Node;
    progressBar: cc.Node;
    gameIcon: cc.Sprite;
    loadingMessage: cc.Label;
    cancelButton: cc.Button;
}
```

#### **Microsite Game Launch**

```typescript
interface MicrositeGameLaunchUI {
    iframeContainer: cc.Node;
    loadingOverlay: cc.Node;
    webviewComponent: CustomWebView;
    backButton: cc.Button;
    sessionSync: cc.Node;
}
```

#### **Gateway Game Launch**

```typescript
interface GatewayGameLaunchUI {
    socketConnector: cc.Node;
    connectionStatus: cc.Label;
    lobbyLoader: cc.Node;
    gameList: cc.Node;
}
```

---

## Session Management UI

### Session Flow

```mermaid
graph LR
    A[Session Start] --> B[Store Session Data]
    B --> C[Set Recheck Interval]
    C --> D[60s Timer]
    D --> E{Session Valid?}
    E -->|Yes| F[Update Session Time]
    E -->|No| G[Sign Out User]
    F --> D
    G --> H[Redirect to Timeout]

    style A fill:#e8f5e8
    style G fill:#ffebee
    style H fill:#ffebee
```

### Session UI Components

```typescript
interface SessionManagementUI {
    // Session timeout warning
    timeoutWarning: {
        dialog: cc.Node;
        countdownTimer: cc.Label;
        extendButton: cc.Button;
        logoutButton: cc.Button;
    };

    // Session refresh
    sessionRefresh: {
        refreshIndicator: cc.Node;
        statusMessage: cc.Label;
        progressBar: cc.Node;
    };

    // Balance updates
    balanceDisplay: {
        balanceLabel: cc.Label;
        updateAnimation: cc.Animation;
        currencyIcon: cc.Sprite;
    };
}
```

---

## Responsive Design Requirements

### Design Specifications

```mermaid
graph TB
    subgraph "Responsive Design Requirements"
        A[Design Resolution] --> B[1398x786]
        A --> C[16:9 Aspect Ratio]
        A --> D[Full-screen Layout]

        B --> E[Widget Components]
        E --> F[Full Stretch]
        E --> G[Center Alignment]
        E --> H[Responsive Scaling]

        subgraph "Layout Modes"
            I[Portrait Mode]
            J[Landscape Mode]
            K[Full-screen Mode]
        end

        H --> I
        H --> J
        H --> K
    end

    style A fill:#e3f2fd
    style E fill:#e8f5e8
    style I fill:#f3e5f5
    style J fill:#fff3e0
    style K fill:#fce4ec
```

### Widget Configuration

```typescript
interface WidgetConfig {
    alignMode: 1; // Full stretch mode
    alignFlags: 45; // All sides aligned
    left: 0; // Left edge
    right: 0; // Right edge
    top: 0; // Top edge
    bottom: 0; // Bottom edge
    horizontalCenter: 0; // Center horizontally
    verticalCenter: 0; // Center vertically
}
```

### Anchor Point Strategy

| Component        | Anchor Point | Purpose              |
| ---------------- | ------------ | -------------------- |
| Canvas           | (0.5, 0.5)   | Center alignment     |
| Background       | (0.5, 0.5)   | Full-screen coverage |
| UI Elements      | (0.5, 0.5)   | Centered positioning |
| Iframe Container | (0.5, 0.5)   | Responsive scaling   |

---

## Implementation Guidelines

### Component Hierarchy

```mermaid
graph TB
    subgraph "Recommended Implementation"
        A[Splash Scene] --> B[UI Manager]
        B --> C[Loading Manager]
        B --> D[Auth Manager]
        B --> E[Game Manager]

        C --> F[Progress UI]
        C --> G[Status UI]

        D --> H[Auth UI]
        D --> I[Session UI]

        E --> J[Game Launch UI]
        E --> K[Microsite UI]

        subgraph "Event System"
            L[UI Events]
            M[Auth Events]
            N[Game Events]
        end

        B --> L
        D --> M
        E --> N
    end

    style A fill:#e3f2fd
    style B fill:#e8f5e8
    style D fill:#f3e5f5
    style E fill:#fff3e0
```

### State Management

```typescript
interface UIStateManagement {
    // Current UI state
    currentState: "loading" | "authenticating" | "gameLaunch" | "error";

    // State transitions
    transitionTo(newState: string): void;

    // UI updates
    updateProgress(progress: number): void;
    updateStatus(message: string): void;
    showError(error: Error): void;

    // Component visibility
    showComponent(component: string): void;
    hideComponent(component: string): void;
}
```

### Event Handling

```typescript
interface UIEventHandling {
    // SSO events
    onSSOSuccess(): void;
    onSSOFailure(error: Error): void;
    onSessionTimeout(): void;

    // Game launch events
    onGameLaunchStart(): void;
    onGameLaunchSuccess(): void;
    onGameLaunchFailure(error: Error): void;

    // User interaction
    onRetryClick(): void;
    onCancelClick(): void;
    onBackToLobby(): void;
}
```

---

## Error Handling UI

### Error UI Flow

```mermaid
graph TD
    A[Error Occurs] --> B{Error Type}

    B -->|Authentication| C[Auth Error Dialog]
    B -->|Network| D[Network Error Dialog]
    B -->|Game Load| E[Game Load Error]
    B -->|Session| F[Session Error]

    C --> G[Show Retry Button]
    D --> H[Show Retry + Help]
    E --> I[Show Alternative Games]
    F --> J[Show Reauth Prompt]

    G --> K[Retry Authentication]
    H --> L[Retry Network]
    I --> M[Load Different Game]
    J --> N[Re-authenticate]

    K --> O{Success?}
    L --> O
    M --> P[Game Launched]
    N --> O

    O -->|Yes| Q[Continue Flow]
    O -->|No| R[Show Final Error]

    style A fill:#ffebee
    style C fill:#ffcdd2
    style D fill:#ffcdd2
    style E fill:#ffcdd2
    style F fill:#ffcdd2
    style Q fill:#e8f5e8
    style R fill:#ffebee
```

### Error Dialog Components

```typescript
interface ErrorDialogUI {
    // Dialog container
    dialog: {
        background: cc.Node;
        content: cc.Node;
        closeButton: cc.Button;
    };

    // Error content
    errorContent: {
        icon: cc.Sprite;
        title: cc.Label;
        message: cc.Label;
        details: cc.Label;
    };

    // Action buttons
    actions: {
        retryButton: cc.Button;
        helpButton: cc.Button;
        cancelButton: cc.Button;
        backToLobbyButton: cc.Button;
    };

    // Animation
    animation: {
        showAnimation: cc.Animation;
        hideAnimation: cc.Animation;
    };
}
```

### Error Message Templates

| Error Type            | Title              | Message                                                        | Actions           |
| --------------------- | ------------------ | -------------------------------------------------------------- | ----------------- |
| Authentication Failed | "Login Failed"     | "Unable to authenticate. Please try again."                    | Retry, Help       |
| Network Error         | "Connection Lost"  | "Network connection interrupted. Please check your internet."  | Retry, Help       |
| Game Load Error       | "Game Unavailable" | "This game is currently unavailable. Please try another game." | Alternative Games |
| Session Expired       | "Session Expired"  | "Your session has expired. Please log in again."               | Re-authenticate   |

---

## Performance Considerations

### Loading Optimization

```mermaid
graph LR
    subgraph "Performance Optimization"
        A[Asset Preloading] --> B[Texture Compression]
        A --> C[Component Lazy Loading]
        A --> D[Memory Management]

        B --> E[WebP Format]
        B --> F[Texture Atlases]

        C --> G[On-demand Loading]
        C --> H[Component Pooling]

        D --> I[Asset Cleanup]
        D --> J[Memory Monitoring]
    end

    style A fill:#e3f2fd
    style B fill:#e8f5e8
    style C fill:#f3e5f5
    style D fill:#fff3e0
```

### Performance Metrics

| Metric            | Target      | Measurement              |
| ----------------- | ----------- | ------------------------ |
| Initial Load Time | < 3 seconds | Asset compilation + auth |
| Scene Transition  | < 500ms     | Scene loading time       |
| UI Responsiveness | < 100ms     | Button click response    |
| Memory Usage      | < 200MB     | Peak memory consumption  |
| Frame Rate        | 60 FPS      | Smooth animations        |

### Optimization Strategies

```typescript
interface PerformanceOptimization {
    // Asset management
    preloadCriticalAssets(): Promise<void>;
    unloadUnusedAssets(): void;

    // Component optimization
    useObjectPooling(): void;
    implementLazyLoading(): void;

    // Memory management
    monitorMemoryUsage(): void;
    cleanupResources(): void;

    // UI optimization
    useTextureAtlases(): void;
    implementCulling(): void;
}
```

---

## Conclusion

This comprehensive UI analysis provides the complete framework for implementing SSO direct-to-game functionality in the Cocos Creator client. The documented components, flows, and requirements ensure:

1. **Seamless User Experience**: Smooth transitions between authentication and game launch
2. **Robust Error Handling**: Comprehensive error states with user-friendly recovery options
3. **Responsive Design**: Full-screen responsive layout across different devices
4. **Performance Optimization**: Efficient loading and resource management
5. **Maintainable Architecture**: Clear component hierarchy and state management

The implementation should follow the documented UI patterns and component structures to ensure consistency and reliability across all SSO scenarios.

---

## Appendix

### Component UUIDs

| Component            | UUID                                 | File                        |
| -------------------- | ------------------------------------ | --------------------------- |
| MicrositeGameWebview | 7b901614-488b-413f-a2be-b1a7a3de4036 | MicrositeGameWebview.prefab |
| Splash Scene         | 2dbb7549-feda-42b6-a6a9-86608310bcaf | Splash.fire                 |
| Lobby Scene          | 2d2f792f-a40c-49bb-a189-ed176a246e49 | Lobby.fire                  |

### File References

-   `assets/splash/views/Splash.fire` - Main splash scene
-   `assets/splash/views/MicrositeGameWebview.prefab` - Microsite game container
-   `assets/lobby/main/views/Lobby.fire` - Lobby scene
-   `assets/mini-games-panel/views/MiniPanel.prefab` - Mini games panel

### Related Documentation

-   [SSO Workflow Documentation](./SSO_WORKFLOW_DOCUMENTATION.md)
-   [Game Configuration Guide](./GAME_CONFIGURATION.md)
-   [Authentication Manager Documentation](./AUTH_MANAGER.md)
