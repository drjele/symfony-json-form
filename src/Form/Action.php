<?php

declare(strict_types=1);

/*
 * Copyright (c) Adrian Jeledintan
 */

namespace Drjele\Symfony\JsonForm\Form;

final class Action
{
    private string $route;
    private ?array $parameters;

    public function __construct(string $route, array $parameters = null)
    {
        $this->route = $route;
        $this->parameters = $parameters;
    }

    public function render(): array
    {
        return [
            'route' => $this->route,
            'parameters' => $this->parameters,
        ];
    }
}
