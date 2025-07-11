# Direct Mode Enforcement Implementation

## Overview

This implementation ensures that when the URL includes `ref=d_direct` or `ref=m_direct`, the direct mode is always enforced and preserved throughout the application lifecycle. The system automatically converts `m_direct` to `d_direct` for consistency and ensures players always access the game in direct mode.

## Key Features

1. **Automatic Direct Mode Detection**: Detects `ref=d_direct` or `ref=m_direct` in URL parameters
2. **Consistency Enforcement**: Converts `m_direct` to `d_direct` automatically
3. **Persistence**: Stores direct mode state in session storage
4. **Cross-Scene Preservation**: Maintains direct mode across scene transitions
5. **Comprehensive Logging**: Detailed logging for debugging and monitoring

## Implementation Details

### 1. AuthManager.js Enhancements

**New Function**: `enforceDirectModeIfNeeded(urlParams)`

- **Purpose**: Checks URL parameters for direct mode refs and enforces direct mode
- **Behavior**:
  - Detects `ref=d_direct` or `ref=m_direct`
  - Converts `m_direct` to `d_direct` and redirects
  - Stores direct mode data in session
  - Updates AppManager state

**Integration**: Called early in `checkSSO()` function

```javascript
// Example URL: ?token=abc123&gameId=134&ref=d_direct&rurl=https://operator.com/return
// Result: Direct mode enforced, data stored, AppManager updated
```

### 2. AppManager.ts Enhancements

**New Method**: `ensureDirectModeConsistency(urlParams: URLSearchParams)`

- **Purpose**: Ensures direct mode consistency during app initialization
- **Behavior**:
  - Validates direct mode refs
  - Converts `m_direct` to `d_direct`
  - Sets direct mode flag
  - Stores direct mode info immediately

**Enhanced Method**: `handleAppMode()`

- **Changes**: Added direct mode consistency check
- **Result**: Direct mode info stored immediately when detected

### 3. GameUtils.ts Enhancements

**New Method**: `ensureDirectModePreservation()`

- **Purpose**: Preserves direct mode state during game operations
- **Behavior**:
  - Checks if currently in direct mode
  - Stores current direct mode state
  - Ensures persistence across operations

**Enhanced Method**: `openGameDirect()`

- **Changes**: Added direct mode preservation call
- **Result**: Direct mode maintained during game launches

### 4. GameRoomActions.ts Enhancements

**Enhanced Function**: `handleGoToOtherScene()`

- **Changes**: Added direct mode preservation before navigation
- **Result**: Direct mode maintained when closing games

### 5. Scene-Level Enhancements

**Splash.ts**: Added direct mode preservation during scene handling
**DummyRoom.ts**: Added direct mode preservation on room load
**GatewayGame.ts**: Added direct mode preservation on gateway load

## URL Parameter Handling

### Supported Direct Mode Refs

- `ref=d_direct` - Desktop direct mode
- `ref=m_direct` - Mobile direct mode (converted to d_direct)

### URL Structure

```
Base URL: https://game.example.com/
Parameters:
- token: Authentication token
- gameId: Target game ID
- ref: d_direct or m_direct
- rurl: Return URL (optional)
```

### Examples

1. **Fresh Login with Direct Mode**:
   ```
   https://game.example.com/?token=abc123&gameId=134&ref=d_direct&rurl=https://operator.com/return
   ```

2. **Mobile Direct Mode (Auto-Converted)**:
   ```
   https://game.example.com/?token=abc123&gameId=134&ref=m_direct&rurl=https://operator.com/return
   ```
   **Result**: Automatically converted to `ref=d_direct`

3. **Session Resume with Direct Mode**:
   ```
   https://game.example.com/?gameId=134&ref=d_direct
   ```
   **Result**: Direct mode restored from session storage

## Session Storage

### Direct Mode Data Structure

```typescript
interface DirectModeData {
    ref: string;           // "d_direct" or "m_direct"
    returnUrl: string;     // Return URL to operator
    directGameId: string;  // Target game ID
    timestamp: number;     // Creation timestamp
}
```

### Storage Key

- **Key**: `directMode`
- **Location**: Session storage
- **Persistence**: Until session expires or manual removal

## Logging

### Console Log Prefixes

- `🔐 [AuthManager]` - Authentication and direct mode enforcement
- `🔧 [AppManager]` - App management and direct mode consistency
- `🎮 [GameUtils]` - Game utilities and direct mode preservation
- `🎮 [Splash]` - Splash scene and direct mode handling
- `🎮 [DummyRoom]` - Dummy room direct mode preservation
- `🎮 [GatewayGame]` - Gateway game direct mode preservation

### Key Log Messages

```
🔐 [AuthManager] Checking for direct mode enforcement...
🔐 [AuthManager] Direct mode ref detected: d_direct
🔐 [AuthManager] Storing direct mode data: {...}
🔧 [AppManager] Ensuring direct mode consistency...
🔧 [AppManager] Direct mode enforced
🎮 [GameUtils] Ensuring direct mode preservation...
🎮 [GameUtils] Direct mode detected, ensuring preservation
```

## Testing

### Test Coverage

Comprehensive test suite in `__tests__/direct-mode/DirectModeEnforcement.test.ts` covering:

1. **AuthManager Direct Mode Enforcement**
   - Direct mode detection
   - m_direct to d_direct conversion
   - No direct mode scenarios

2. **AppManager Direct Mode Consistency**
   - Direct mode consistency checks
   - URL parameter handling

3. **GameUtils Direct Mode Preservation**
   - Direct mode preservation during operations
   - Non-direct mode scenarios

4. **Direct Mode URL Scenarios**
   - Fresh login with direct mode
   - Session resume with direct mode
   - Microsite games with direct mode

5. **Direct Mode Persistence**
   - Cross-page persistence
   - Session mismatch handling

6. **Edge Cases**
   - Missing parameters
   - Multiple refs
   - Invalid scenarios

### Running Tests

```bash
npm test -- --testPathPattern=DirectModeEnforcement.test.ts
```

## Integration Points

### 1. SSO Workflow Integration

- **Entry Point**: `AuthManager.checkSSO()`
- **Timing**: Early in authentication process
- **Result**: Direct mode enforced before game launch

### 2. App Initialization Integration

- **Entry Point**: `AppManager.handleAppMode()`
- **Timing**: During app initialization
- **Result**: Direct mode consistency ensured

### 3. Game Launch Integration

- **Entry Point**: `GameUtils.openGameDirect()`
- **Timing**: Before game scene loading
- **Result**: Direct mode preserved during game launch

### 4. Scene Transition Integration

- **Entry Points**: Various scene components
- **Timing**: During scene loading
- **Result**: Direct mode maintained across scenes

## Error Handling

### 1. Invalid Direct Mode Refs

- **Behavior**: Ignored, treated as normal mode
- **Logging**: Warning message logged

### 2. Missing Parameters

- **Behavior**: Default values used
- **Defaults**:
  - `directGameId`: "0"
  - `returnUrl`: ""
  - `ref`: "d_direct"

### 3. Session Mismatch

- **Behavior**: Direct mode not restored
- **Logging**: Info message logged

## Performance Considerations

### 1. Minimal Impact

- **URL Checks**: Only during initialization
- **Storage Operations**: Only when direct mode detected
- **Memory Usage**: Negligible additional memory

### 2. Optimization

- **Caching**: Direct mode data cached in session
- **Lazy Loading**: Direct mode checks only when needed
- **Efficient Storage**: Minimal data structure

## Security Considerations

### 1. URL Parameter Validation

- **Input Sanitization**: URL parameters validated
- **Type Checking**: Parameter types verified
- **Length Limits**: Parameter length restricted

### 2. Session Security

- **Session Validation**: Direct mode tied to valid session
- **Expiration**: Direct mode expires with session
- **Isolation**: Direct mode data isolated per session

## Future Enhancements

### 1. Additional Direct Mode Types

- Support for additional direct mode refs
- Custom direct mode configurations
- Platform-specific direct modes

### 2. Enhanced Persistence

- Cross-browser persistence
- Offline direct mode support
- Backup direct mode storage

### 3. Advanced Logging

- Direct mode analytics
- Performance monitoring
- Error tracking

## Conclusion

This implementation provides a robust, comprehensive solution for direct mode enforcement that ensures players always access games in direct mode when the appropriate URL parameters are present. The system is designed to be reliable, performant, and maintainable while providing detailed logging for debugging and monitoring purposes. 