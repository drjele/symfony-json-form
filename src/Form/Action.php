<?php

declare(strict_types=1);

/*
 * Copyright (c) Adrian Jeledintan
 */

namespace Drjele\Symfony\JsonForm\Form;

final class Action
{
    public function __construct(
        private readonly string $route,
        private readonly ?array $parameters = null
    ) {}

    public function render(): array
    {
        return [
            'route' => $this->route,
            'parameters' => $this->parameters,
        ];
    }
}
